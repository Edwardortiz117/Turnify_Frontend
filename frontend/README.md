# Frontend (`frontend/`)

Código de la SPA Turnify (React + Vite + TypeScript + Tailwind).

La documentación de producto, arranque y Docker está en la **raíz del monorepo**:

- [`../README.md`](../README.md) — quick start, Docker, CapRover, anti-engaño localStorage
- [`../PRODUCT.md`](../PRODUCT.md) — alcance y usuarios del MVP
- [`../DESIGN.md`](../DESIGN.md) — sistema visual
- [`../docs/frontend-api-contract.md`](../docs/frontend-api-contract.md) — contrato HTTP

## Scripts

```bash
cp .env.example .env   # proxy → http://localhost:3000
npm install
npm run dev            # http://localhost:5173
npm run build
npm test
npm run lint
```

Requiere **Turnify_Backend** en `:3000` (o el `VITE_PROXY_TARGET` que configures).
