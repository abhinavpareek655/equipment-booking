backend structure: 
```
project-root/
├── app/
│   └── api/
│       ├── auth/                # login, register
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── booking/             # booking CRUD
│       │   ├── route.ts         # POST booking
│       │   └── [id]/route.ts    # GET, PUT, DELETE
│       ├── equipment/           # add/view equipment
│       │   └── route.ts
│       ├── users/               # user profile management
│       │   └── route.ts
│       └── middleware.ts        # auth/role checks
├── lib/
│   └── db.ts                    # Mongoose connection
├── models/
│   ├── User.ts
│   ├── Equipment.ts
│   └── Booking.ts
├── .env.local                   # MongoDB URI & secrets
├── package.json
├── next.config.js
└── tsconfig.json
```