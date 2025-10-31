# 🏗️ Architecture Documentation

## System Architecture Overview

This document provides a comprehensive overview of the Caption Cursor Studio architecture, including component relationships, data flow, and design patterns.

---

## 📊 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend Application"
        NextJS[Next.js App Router]

        subgraph "Presentation Layer"
            Pages[Pages/Routes]
            Components[UI Components]
            Hero[Hero Component]
            Gallery[Gallery Component]
            Upload[Upload Component]
        end

        subgraph "Business Logic Layer"
            Hooks[Custom Hooks]
            Contexts[React Contexts]
            Services[Service Layer]
        end

        subgraph "Data Layer"
            API[API Client]
            SecureClient[Secure API Client]
            Storage[Local Storage]
        end

        subgraph "Infrastructure Layer"
            Utils[Utilities]
            Security[Security Utils]
            Validators[Validators]
        end
    end

    subgraph "Backend API"
        Backend[Backend Server]
        AI[AI Service]
        DB[(Database)]
        FileStorage[File Storage]
    end

    Browser --> NextJS
    Mobile --> NextJS

    Pages --> Components
    Pages --> Hooks
    Components --> Hooks
    Hooks --> Contexts
    Hooks --> Services
    Services --> API
    API --> SecureClient
    SecureClient --> Backend
    Backend --> AI
    Backend --> DB
    Backend --> FileStorage

    Utils --> Security
    Utils --> Validators
    Security --> API
    Validators --> Components

    Storage -.-> Contexts

    style NextJS fill:#0070f3,stroke:#0070f3,color:#fff
    style Backend fill:#10b981,stroke:#10b981,color:#fff
    style AI fill:#8b5cf6,stroke:#8b5cf6,color:#fff
```

---

## 🎯 Component Architecture

```mermaid
graph LR
    subgraph "Pages"
        Home[Home Page]
        UploadPage[Upload Page]
    end

    subgraph "Layout Components"
        RootLayout[Root Layout]
        Navbar[Navigation]
    end

    subgraph "Feature Components"
        Hero[Hero Section]
        BulkUpload[Bulk Upload]
        MyGallery[My Gallery]
        MyImageCard[Image Card]
    end

    subgraph "UI Components"
        Button[Button]
        SearchBar[Search Bar]
        CustomSelect[Custom Select]
        LoadingState[Loading State]
        ErrorDisplay[Error Display]
        ConfirmationModal[Confirmation Modal]
    end

    subgraph "Context Providers"
        AuthContext[Auth Context]
        GalleryContext[Gallery Context]
    end

    Home --> Hero
    UploadPage --> BulkUpload
    UploadPage --> MyGallery
    MyGallery --> MyImageCard
    MyGallery --> SearchBar
    MyGallery --> CustomSelect

    MyImageCard --> Button
    MyImageCard --> ConfirmationModal
    BulkUpload --> LoadingState
    BulkUpload --> ErrorDisplay

    RootLayout --> AuthContext
    RootLayout --> GalleryContext
    RootLayout --> Navbar

    style Hero fill:#f59e0b,stroke:#f59e0b,color:#fff
    style BulkUpload fill:#3b82f6,stroke:#3b82f6,color:#fff
    style MyGallery fill:#8b5cf6,stroke:#8b5cf6,color:#fff
```

---

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Hook as Custom Hook
    participant Service as Service Layer
    participant API as API Client
    participant Backend as Backend API
    participant AI as AI Service

    User->>UI: Upload Image
    UI->>Hook: useFileUpload()
    Hook->>Service: Validate File
    Service->>Hook: Validation Result
    Hook->>API: POST /api/files
    API->>Backend: HTTP Request
    Backend->>AI: Analyze Image
    AI->>Backend: Description & Tags
    Backend->>API: Response
    API->>Hook: File Data
    Hook->>UI: Update State
    UI->>User: Show Success

    Note over User,AI: Complete upload flow with AI analysis
```

---

## 🏛️ Layered Architecture

```mermaid
graph TB
    subgraph "Layer 1: Presentation"
        A1[Pages] --> A2[Components]
        A2 --> A3[Layouts]
    end

    subgraph "Layer 2: Business Logic"
        B1[Custom Hooks] --> B2[Contexts]
        B2 --> B3[Service Container]
        B3 --> B4[Services]
    end

    subgraph "Layer 3: Data Access"
        C1[API Client] --> C2[HTTP Client]
        C2 --> C3[Request/Response]
    end

    subgraph "Layer 4: Infrastructure"
        D1[Utilities] --> D2[Validators]
        D2 --> D3[Security Utils]
    end

    subgraph "Layer 5: External"
        E1[Backend API]
        E2[File Storage]
        E3[AI Service]
    end

    A2 --> B1
    B4 --> C1
    C1 --> D3
    C3 --> E1
    E1 --> E2
    E1 --> E3

    style A1 fill:#3b82f6,stroke:#3b82f6,color:#fff
    style B1 fill:#8b5cf6,stroke:#8b5cf6,color:#fff
    style C1 fill:#10b981,stroke:#10b981,color:#fff
    style D1 fill:#f59e0b,stroke:#f59e0b,color:#fff
    style E1 fill:#ef4444,stroke:#ef4444,color:#fff
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        Input[User Input]
        Validation[Input Validation]
        Sanitization[Sanitization]
        RateLimit[Rate Limiting]
    end

    subgraph "Network Security"
        HTTPS[HTTPS/TLS]
        Headers[Security Headers]
        CORS[CORS Policy]
        CSRF[CSRF Protection]
    end

    subgraph "API Security"
        Auth[Authentication]
        FileVal[File Validation]
        MagicBytes[Magic Bytes Check]
        SizeLimit[Size Limits]
    end

    subgraph "Storage Security"
        PathSan[Path Sanitization]
        SecureStorage[Secure Storage]
    end

    Input --> Validation
    Validation --> Sanitization
    Sanitization --> RateLimit
    RateLimit --> HTTPS
    HTTPS --> Headers
    Headers --> CORS
    CORS --> CSRF
    CSRF --> Auth
    Auth --> FileVal
    FileVal --> MagicBytes
    MagicBytes --> SizeLimit
    SizeLimit --> PathSan
    PathSan --> SecureStorage

    style Input fill:#3b82f6,stroke:#3b82f6,color:#fff
    style HTTPS fill:#10b981,stroke:#10b981,color:#fff
    style Auth fill:#8b5cf6,stroke:#8b5cf6,color:#fff
    style SecureStorage fill:#f59e0b,stroke:#f59e0b,color:#fff
```

---

## 📦 Service Container Pattern

```mermaid
classDiagram
    class ServiceContainer {
        -authService: AuthService
        -storageService: StorageService
        -loggerService: LoggerService
        +getAuthService()
        +getStorageService()
        +getLoggerService()
    }

    class AuthService {
        +login(credentials)
        +logout()
        +getToken()
        +refreshToken()
    }

    class StorageService {
        +getItem(key)
        +setItem(key, value)
        +removeItem(key)
        +clear()
    }

    class LoggerService {
        +log(message)
        +error(message)
        +warn(message)
        +debug(message)
    }

    ServiceContainer --> AuthService
    ServiceContainer --> StorageService
    ServiceContainer --> LoggerService
```

---

## 🎨 State Management

```mermaid
graph TB
    subgraph "Global State"
        AuthCtx[Auth Context]
        GalleryCtx[Gallery Context]
    end

    subgraph "Component State"
        LocalState[useState]
        FormState[Form State]
        UIState[UI State]
    end

    subgraph "Persistent State"
        LocalStorage[Local Storage]
        SessionStorage[Session Storage]
    end

    subgraph "Server State"
        APICache[API Cache]
        QueryState[Query State]
    end

    AuthCtx --> LocalStorage
    GalleryCtx --> APICache
    LocalState --> FormState
    FormState --> UIState
    LocalStorage -.sync.-> AuthCtx
    SessionStorage -.sync.-> LocalState

    style AuthCtx fill:#3b82f6,stroke:#3b82f6,color:#fff
    style LocalStorage fill:#10b981,stroke:#10b981,color:#fff
    style APICache fill:#8b5cf6,stroke:#8b5cf6,color:#fff
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Dev Server]
        DevDB[Dev Database]
    end

    subgraph "CI/CD Pipeline"
        GitHub[GitHub]
        Actions[GitHub Actions]
        Tests[Run Tests]
        Build[Build Project]
        Deploy[Deploy]
    end

    subgraph "Production"
        Vercel[Vercel Platform]
        CDN[Vercel CDN]
        Edge[Edge Functions]
    end

    subgraph "Backend Services"
        API[Production API]
        ProdDB[(Production DB)]
        Storage[File Storage]
        AIService[AI Service]
    end

    subgraph "Monitoring"
        Logs[Logs]
        Analytics[Analytics]
        Errors[Error Tracking]
    end

    Dev --> GitHub
    GitHub --> Actions
    Actions --> Tests
    Tests --> Build
    Build --> Deploy
    Deploy --> Vercel
    Vercel --> CDN
    Vercel --> Edge
    CDN --> API
    API --> ProdDB
    API --> Storage
    API --> AIService
    Vercel --> Logs
    Vercel --> Analytics
    Vercel --> Errors

    style Vercel fill:#000,stroke:#000,color:#fff
    style GitHub fill:#333,stroke:#333,color:#fff
    style API fill:#10b981,stroke:#10b981,color:#fff
```

---

## 📱 Responsive Design Architecture

```mermaid
graph LR
    subgraph "Breakpoints"
        Mobile["Mobile < 640px"]
        Tablet["Tablet ≥ 640px"]
        Desktop["Desktop ≥ 1024px"]
    end

    subgraph "Mobile Optimizations"
        M1[Compact Spacing]
        M2[Touch Targets]
        M3[Single Column]
        M4[Hidden Labels]
    end

    subgraph "Tablet Optimizations"
        T1[Medium Spacing]
        T2[Two Columns]
        T3[Visible Labels]
        T4[Horizontal Layout]
    end

    subgraph "Desktop Optimizations"
        D1[Spacious Layout]
        D2[Three Columns]
        D3[Full Features]
        D4[Hover Effects]
    end

    Mobile --> M1
    Mobile --> M2
    Mobile --> M3
    Mobile --> M4

    Tablet --> T1
    Tablet --> T2
    Tablet --> T3
    Tablet --> T4

    Desktop --> D1
    Desktop --> D2
    Desktop --> D3
    Desktop --> D4

    style Mobile fill:#3b82f6,stroke:#3b82f6,color:#fff
    style Tablet fill:#8b5cf6,stroke:#8b5cf6,color:#fff
    style Desktop fill:#10b981,stroke:#10b981,color:#fff
```

---

## 🧪 Testing Architecture

```mermaid
graph TB
    subgraph "Unit Tests"
        U1[Component Tests]
        U2[Hook Tests]
        U3[Utility Tests]
        U4[Service Tests]
    end

    subgraph "Integration Tests"
        I1[API Tests]
        I2[Service Integration]
        I3[Data Flow Tests]
    end

    subgraph "E2E Tests"
        E1[User Flows]
        E2[Authentication]
        E3[Upload Flow]
        E4[Gallery Flow]
    end

    subgraph "Testing Tools"
        Vitest[Vitest]
        RTL[React Testing Library]
        Playwright[Playwright]
        Coverage[Coverage Reporter]
    end

    U1 --> Vitest
    U2 --> Vitest
    U3 --> Vitest
    U4 --> Vitest

    I1 --> Vitest
    I2 --> Vitest
    I3 --> Vitest

    E1 --> Playwright
    E2 --> Playwright
    E3 --> Playwright
    E4 --> Playwright

    U1 --> RTL

    Vitest --> Coverage
    Playwright --> Coverage

    style Vitest fill:#729b1b,stroke:#729b1b,color:#fff
    style Playwright fill:#2ecd6f,stroke:#2ecd6f,color:#fff
    style Coverage fill:#f59e0b,stroke:#f59e0b,color:#fff
```

---

## 🔄 API Request Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Hook
    participant S as Service
    participant AC as API Client
    participant SC as Secure Client
    participant I as Interceptor
    participant B as Backend

    C->>H: Call Hook Function
    H->>S: Validate Input
    S->>AC: Call API Function
    AC->>SC: Make HTTP Request
    SC->>I: Request Interceptor
    I->>I: Add Headers/Token
    I->>B: Send Request
    B->>I: Response
    I->>SC: Response Interceptor
    SC->>SC: Validate Response
    SC->>AC: Return Data
    AC->>H: Return Result
    H->>C: Update State

    Note over C,B: Complete request/response cycle
```

---

## 📂 File Structure Mapping

```
src/
├── app/                          # Next.js App Router (Presentation Layer)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── upload/                  # Upload feature
│       └── page.tsx             # Upload page
│
├── components/ui/               # UI Components (Presentation Layer)
│   ├── Button.tsx              # Reusable button
│   ├── BulkUpload.tsx          # Upload component
│   ├── MyGallery.tsx           # Gallery component
│   ├── MyImageCard.tsx         # Card component
│   ├── SearchBar.tsx           # Search component
│   ├── CustomSelect.tsx        # Select component
│   └── ...                     # Other UI components
│
├── hooks/                       # Custom Hooks (Business Logic Layer)
│   ├── useFileUpload.ts        # File upload logic
│   └── index.ts                # Hook exports
│
├── lib/                         # Libraries (Data Layer)
│   ├── api.ts                  # API functions
│   ├── contexts.tsx            # React contexts
│   ├── secureApiClient.ts      # HTTP client
│   └── utils/                  # Utility functions
│       ├── validators.ts       # Validation utilities
│       ├── security.ts         # Security utilities
│       └── ...                 # Other utilities
│
├── core/                        # Core Services (Business Logic Layer)
│   └── services/
│       ├── container.ts        # DI container
│       └── implementations/    # Service implementations
│           ├── AuthService.ts
│           ├── StorageService.ts
│           └── LoggerService.ts
│
└── middleware.ts                # Next.js middleware (Infrastructure Layer)
```

---

## 🎯 Design Patterns Used

### 1. **Dependency Injection (DI)**

- Service Container manages service instances
- Loose coupling between components
- Easy to mock for testing

### 2. **Repository Pattern**

- Centralized data access through API client
- Abstraction over data sources
- Consistent error handling

### 3. **Observer Pattern**

- React Context for state updates
- Components subscribe to context changes
- Decoupled component communication

### 4. **Factory Pattern**

- Service creation through container
- Singleton service instances
- Lazy initialization

### 5. **Strategy Pattern**

- Different validation strategies
- Pluggable security implementations
- Flexible file upload strategies

### 6. **Facade Pattern**

- API client simplifies backend calls
- Hooks abstract complex logic
- Clean component interfaces

---

## 🔑 Key Architectural Decisions

### ✅ **Next.js App Router**

- Modern React features (Server Components)
- Built-in routing and layouts
- Optimized performance

### ✅ **Layered Architecture**

- Clear separation of concerns
- Easy to maintain and test
- Scalable structure

### ✅ **Service Layer**

- Reusable business logic
- Dependency injection
- Testable services

### ✅ **Custom Hooks**

- Encapsulated component logic
- Reusable across components
- Easier testing

### ✅ **Context API**

- Global state management
- No external dependencies
- Simple and effective

### ✅ **Secure API Client**

- Centralized request handling
- Interceptors for auth
- Consistent error handling

---

## 📈 Scalability Considerations

### **Horizontal Scaling**

- Stateless components
- API-driven architecture
- Cacheable responses

### **Vertical Scaling**

- Code splitting
- Lazy loading
- Image optimization

### **Performance**

- Server-side rendering
- Static generation
- Edge caching

### **Maintainability**

- Clear structure
- Type safety (TypeScript)
- Comprehensive testing

---

## 🔮 Future Architecture Enhancements

### **Potential Improvements**

- WebSocket for real-time updates
- Service Workers for offline support
- Progressive Web App (PWA)
- GraphQL for flexible data fetching
- Micro-frontend architecture
- Distributed caching layer

---

Built with ❤️ following best practices and SOLID principles
