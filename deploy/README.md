# Deploy

The app runs on the household's OCI Kubernetes cluster at `https://budget.apps.gwiazdeczkowo.top` (architecture §9).

## How a merge reaches the cluster

1. The `ci` job passes on `main`.
2. The `images` job builds `ghcr.io/kozlovvski/budget-web` and `ghcr.io/kozlovvski/budget-api` for arm64 and tags both `sha-<commit>`.
3. The `deploy` job sets both `newTag` lines in `deploy/kustomization.yaml` and pushes `deploy: sha-<commit> [skip ci]` to `main` with the deploy key.
4. The ArgoCD Application `budget` syncs `deploy/`.

**Rollback:** revert the tag-bump commit through a pull request, or roll back in the ArgoCD UI, which pauses auto-sync until you turn it back on. The database and role survive both.

## One-time setup

Run these from the repo root, with `KUBECONFIG` pointing at the cluster and `gh` signed in as the repo owner. Secrets never go into git.

**1. Deploy key** for the tag-bump push. Keep the private key only in the Actions secret:

```sh
ssh-keygen -t ed25519 -N '' -C budget-deploy -f /tmp/budget-deploy
gh repo deploy-key add /tmp/budget-deploy.pub --allow-write --title "CI tag bump"
gh secret set DEPLOY_KEY < /tmp/budget-deploy
rm /tmp/budget-deploy /tmp/budget-deploy.pub
# Let deploy keys bypass the "Protect main" ruleset. This is the repo's only deploy key.
gh api -X PUT repos/kozlovvski/budget_app/rulesets/25352561 \
  --input - <<< '{"bypass_actors":[{"actor_id":null,"actor_type":"DeployKey","bypass_mode":"always"}]}'
```

**2. Namespace and secrets:**

```sh
kubectl create namespace budget
pw=$(openssl rand -hex 24)
for ns in postgres budget; do
  kubectl create secret generic budget-db -n $ns --type=kubernetes.io/basic-auth \
    --from-literal=username=budget --from-literal=password="$pw"
done
kubectl label secret budget-db -n postgres cnpg.io/reload=true  # CNPG picks up a rotated password
pw=$(openssl rand -hex 24)
kubectl create secret generic budget-redis -n budget --type=kubernetes.io/basic-auth \
  --from-literal=username=budget --from-literal=password="$pw"
echo "user budget on #$(printf %s "$pw" | sha256sum | cut -d' ' -f1) ~budget:* +@all -@dangerous +info"
```

Redis is the platform's shared instance. Append the line printed last to its `redis-users` secret and reload, as the header of `platform/redis/redis.yaml` in the platform repo describes. The user can only touch keys starting `budget:` and can't run admin commands such as `FLUSHALL`.

**3. First images.** Merge to `main` and wait for the `deploy` job. The cluster pulls without credentials, so both packages must be public. If `docker manifest inspect ghcr.io/kozlovvski/budget-web:<tag>` fails while signed out, open `https://github.com/users/kozlovvski/packages/container/budget-web/settings`, then "Change visibility" and choose "Public". Do the same for `budget-api`.

**4. The Application:**

```sh
kubectl apply -f argocd/application.yaml
```

**5. Lock the database.** Once `kubectl get database -n postgres budget` shows it applied, revoke `CONNECT` from `PUBLIC`. Otherwise the platform's monitoring role, which has `pg_read_all_data`, can read every table (architecture §8):

```sh
kubectl exec -n postgres pod/pg-1 -c postgres -- psql -c 'REVOKE CONNECT ON DATABASE budget FROM PUBLIC'
```

`pg-1` is the primary today; `kubectl get pod -n postgres -l cnpg.io/instanceRole=primary` finds it.
