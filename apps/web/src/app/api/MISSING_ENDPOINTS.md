# ⚠️ Missing API Endpoints - Employee Management

**Data**: 30 Settembre 2025
**Rilevato da**: Claude Code Assistant
**Priorità**: ALTA

---

## 📋 Problema

Il modal **EmployeeModal** gestisce operazioni CRUD sui dipendenti, ma **AUTHENTICATION-GUIDE.md non documenta endpoint corrispondenti**.

### Endpoint Necessari Mancanti

#### 1. POST /employee/create - Create Employee
```json
Request: {
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "employee | manager",
  "company_id": "string"
}

Response: {
  "status_code": 200,
  "message": "Employee created successfully",
  "payload": {
    "data": {
      "uuid": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "company_id": "string",
      "created_at": "string"
    }
  }
}
```

#### 2. GET /employees - Get All Employees
```json
Response: {
  "status_code": 200,
  "message": "Employees retrieved successfully",
  "payload": {
    "data": [
      {
        "uuid": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "company_id": "string",
        "is_active": boolean,
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
}
```

#### 3. GET /employee/{uuid} - Get Single Employee
```json
Response: {
  "status_code": 200,
  "message": "Employee retrieved successfully",
  "payload": {
    "data": {
      "uuid": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "company_id": "string",
      "is_active": boolean,
      "created_at": "string",
      "updated_at": "string"
    }
  }
}
```

#### 4. PUT /employee/{uuid} - Update Employee
```json
Request: {
  "name": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)",
  "role": "string (optional)",
  "is_active": boolean (optional)
}

Response: {
  "status_code": 200,
  "message": "Employee updated successfully",
  "payload": {
    "data": {
      "uuid": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "updated_at": "string"
    }
  }
}
```

#### 5. DELETE /employee/{uuid} - Delete Employee
```json
Response: {
  "status_code": 200,
  "message": "Employee deleted successfully",
  "payload": {
    "data": null
  }
}
```

---

## 🔄 Alternative Soluzioni

### Opzione 1: Usare `/auth/register` esistente
**PRO**:
- Endpoint già implementato
- Gestisce creazione utente con password hashing

**CONTRO**:
- Non progettato per gestione admin dipendenti
- Manca filtro per company_id
- Non supporta role assignment dinamico

### Opzione 2: Implementare nuovi endpoint `/employee/*`
**PRO**:
- CRUD completo per gestione aziendale
- Filtri per company_id
- Role-based access control

**CONTRO**:
- Richiede sviluppo backend
- Authentication middleware necessaria

---

## 🎯 Raccomandazioni

### Immediato (Opzione 1)
```typescript
// Adattare EmployeeModal per usare /auth/register
const handleSubmit = async (employeeData: EmployeeFormData) => {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      email: employeeData.email,
      password: employeeData.password,
      name: employeeData.name,
      role: employeeData.role,
      companyId: currentUser.companyId // From auth context
    })
  });

  // ... handle response
};
```

### Long-term (Opzione 2)
Backend team deve implementare:
1. `POST /employee/create`
2. `GET /employees?company_id={id}`
3. `PUT /employee/{uuid}`
4. `DELETE /employee/{uuid}`

Con middleware authentication:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'x-api-key': API_KEY
}
```

---

## 📝 Stato Attuale

### Frontend EmployeeModal
- ✅ **UI completa**: Form validation, error handling
- ✅ **Types definiti**: `EmployeeFormData`, `Employee`
- ❌ **Endpoint mancanti**: Nessuna integrazione API reale
- ⚠️ **Workaround**: Usa mock data in `src/lib/mock-data.ts`

### Backend Documentato
- ✅ `/auth/login` - Login esistente
- ✅ `/auth/register` - Registrazione base (non per admin)
- ✅ `/auth/refresh` - Token refresh
- ✅ `/auth/me` - Current user
- ❌ `/employee/*` - **MANCANTE**

---

## 🚨 Azioni Richieste

### 1. Backend Team
- [ ] Implementare endpoint `/employee/create`
- [ ] Implementare endpoint `/employees` con filtro company
- [ ] Implementare endpoint `/employee/{uuid}` (GET, PUT, DELETE)
- [ ] Aggiungere role-based authorization
- [ ] Documentare in `AUTHENTICATION-GUIDE.md`

### 2. Frontend Team
- [x] Allineare `EmployeeModal` interface con API future
- [ ] Implementare integrazione API quando disponibile
- [ ] Rimuovere mock data per employee management
- [ ] Aggiungere error handling per API calls

---

## 📚 Riferimenti

- **Modal Frontend**: `/src/components/modals/EmployeeModal.tsx`
- **Mock Data**: `/src/lib/mock-data.ts`
- **API Guide**: `/AUTHENTICATION-GUIDE.md`
- **Types**: `/src/types/index.ts`

---

**Contatto Backend Team**: Segnalare urgentemente la mancanza di questi endpoint per completare la feature di gestione dipendenti.