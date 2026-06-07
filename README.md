# 🏥 Hospital Appointment Management System

A full-stack web application for managing hospital appointments between patients, doctors, and admins — with token-based queue management and real-time queue position tracking.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Django + Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |

---

## ✨ Features

### 👤 Patient
- Register and login
- Book appointments with available doctors
- Select time slots based on doctor availability
- View all appointments and their statuses
- Cancel pending appointments
- See real-time queue position and token number
- Auto-refreshing queue (every 10 seconds)

### 🩺 Doctor
- View all assigned appointments
- Mark appointments as completed or cancelled
- Set weekly availability (days, hours, slot duration)
- View token numbers for each patient

### 🔧 Admin
- View all appointments across the system
- Assign token numbers to confirmed appointments
- Token assignment auto-sets status to `confirmed`

### 🔐 Auth
- Role-based access (patient / doctor / admin)
- JWT access + refresh tokens
- Auto token refresh on expiry (no silent logout)
- Redirect to login if refresh token also expires

---

## 📁 Project Structure

```
project/
│
├── backend/                        # Django project
│   ├── manage.py
│   ├── core/                       # Main Django app
│   │   ├── models.py               # User, Appointment, DoctorAvailability
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   └── backend/
│       ├── settings.py
│       └── urls.py
│
└── frontend/                       # React + Vite project
    ├── src/
    │   ├── api.js                  # Central apiFetch with JWT refresh
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── BookAppointment.jsx
    │   └── main.jsx
    └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

---

### Backend Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create superuser (optional)
python manage.py createsuperuser

# 6. Start server
python manage.py runserver
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`
Backend runs at: `http://127.0.0.1:8000`

---

### Backend Settings

Add to `settings.py`:

```python
from datetime import timedelta

INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

AUTH_USER_MODEL = 'core.User'
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register/` | Register new user |
| POST | `/api/login/` | Login and get tokens |
| POST | `/api/token/refresh/` | Refresh access token |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments/` | Get appointments (role-based) |
| POST | `/api/appointments/book/` | Book appointment (patient) |
| PATCH | `/api/appointments/<id>/status/` | Update status (doctor/admin) |
| PATCH | `/api/appointments/<id>/cancel/` | Cancel appointment (patient) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/settoken/` | Assign token to appointment |

### Doctor
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors/` | List all doctors |
| GET/POST | `/api/availability/` | Get or set availability |
| DELETE | `/api/availability/<id>/delete/` | Remove availability day |

### Slots & Queue
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/slots/<doctor_id>/?date=YYYY-MM-DD` | Get available time slots |
| GET | `/api/queueposition/` | Get patient's queue position |

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| `patient` | Book appointments, view queue position, cancel appointments |
| `doctor` | View appointments, complete/cancel, set availability |
| `admin` | View all appointments, assign tokens |

---

## 🔄 Appointment Flow

```
Patient books appointment (status: pending)
        ↓
Admin assigns token (status: confirmed, token_no set)
        ↓
Patient sees queue position on dashboard
        ↓
Doctor marks appointment complete (status: completed)
        ↓
Queue position updates for next patient
```

---

## 🛠️ Known Limitations / Future Improvements

- [ ] WebSocket support for real-time queue updates (Django Channels)
- [ ] Email notifications on booking and token assignment
- [ ] Prescription management after appointment completion
- [ ] Admin analytics dashboard with charts
- [ ] Profile editing for doctors and patients
- [ ] Password reset flow
- [ ] Production deployment (PostgreSQL + Gunicorn + Nginx)

---

## 🧑‍💻 Author

Built as a full-stack learning project using Django REST Framework and React.
