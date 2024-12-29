# DAZN-Movies-app

Backend for Movies app

run project = npn run dev
run test = npm run test

module contains movies data endpoints

Directory structure:
└── DeepakSampath7-DAZN-Movies-app/
    ├── jest.config.js
    ├── package.json
    ├── index.ts
    ├── tsconfig.json
    ├── README.md
    └── src/
        ├── controllers/
        │   ├── MoviesController.ts
        │   └── LoginControler.ts
        ├── tests/
        │   └── movie.test.ts
        ├── models/
        │   ├── MoviesSchema.ts
        │   └── UsersSchema.ts
        ├── config/
        │   ├── jwt.ts
        │   ├── Redis.ts
        │   ├── sessionStore.ts
        │   └── session.ts
        ├── routes/
        │   ├── UserRoutes.ts
        │   └── MoviesRoutes.ts
        ├── middleware/
        │   └── AdminMiddleware.ts
        └── types/
            ├── express.d.ts
            └── session.d.ts
