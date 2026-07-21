# Contributing to Eventix

## Git Flow

This project follows [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching strategy.

### Branch Structure

```
master (production)
  └── develop (integration)
        ├── feature/phase1-auth-rbac
        ├── feature/phase2-events-tickets
        ├── feature/phase3-payment
        ├── feature/phase4-checkin-waitlist
        ├── feature/phase5-frontend
        └── feature/phase6-i18n-polish
```

### Branch Types

| Branch | Purpose | Naming Convention |
|--------|---------|------------------|
| `master` | Production-ready code | - |
| `develop` | Integration branch for features | - |
| `feature/*` | New features | `feature/phase1-auth-rbac` |
| `hotfix/*` | Urgent production fixes | `hotfix/fix-payment-bug` |
| `release/*` | Release preparation | `release/v1.0.0` |

### Workflow

#### 1. Start a New Feature

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch from develop
git checkout -b feature/your-feature-name develop
```

#### 2. Develop & Commit

```bash
# Make changes
git add .
git commit -m "feat: add your feature description"
```

#### 3. Sync with Develop (Rebase)

```bash
# Fetch latest develop
git fetch origin

# Rebase your feature on latest develop
git rebase origin/develop
```

#### 4. Finish Feature (Merge to Develop)

```bash
# Switch to develop
git checkout develop

# Merge feature branch (no fast-forward)
git merge --no-ff feature/your-feature-name

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote feature branch
git push origin --delete feature/your-feature-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |

#### Examples

```bash
git commit -m "feat(auth): add JWT authentication"
git commit -m "fix(checkout): prevent double payment submission"
git commit -m "docs(prd): update API endpoint specs"
git commit -m "test(ticket): add unit tests for stock calculation"
```

### Development Phases

| Phase | Feature Branch | Description |
|-------|---------------|-------------|
| 1 | `feature/phase1-foundation` | Auth, RBAC, Database |
| 2 | `feature/phase2-events-tickets` | Event & Ticket CRUD |
| 3 | `feature/phase3-payment` | Midtrans Integration |
| 4 | `feature/phase4-checkin-waitlist` | Tickets, Check-in, Waitlist |
| 5 | `feature/phase5-frontend` | React Frontend |
| 6 | `feature/phase6-i18n-polish` | i18n, Polish |

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Create Pull Request from `feature/*` to `develop`
4. Request review
5. Squash and merge after approval

### Release Process

```bash
# Create release branch from develop
git checkout -b release/v1.0.0 develop

# Make release adjustments (version bump, etc.)
git commit -m "chore: bump version to 1.0.0"

# Finish release (merge to master and develop)
git checkout master
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin master --tags

git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# Delete release branch
git branch -d release/v1.0.0
```

### Hotfix Process

```bash
# Create hotfix from master
git checkout -b hotfix/urgent-fix master

# Make fix and commit
git commit -m "fix: fix critical production bug"

# Finish hotfix
git checkout master
git merge --no-ff hotfix/urgent-fix
git push origin master

git checkout develop
git merge --no-ff hotfix/urgent-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/urgent-fix
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
