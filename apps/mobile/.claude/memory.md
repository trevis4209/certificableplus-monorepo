# Session Memory - App CertPlus

## 🧠 Session Knowledge Base

### Recent Major Changes
- **Backend Migration**: Switched from Supabase to MySQL with JWT auth
- **Type Organization**: Separated interfaces into `/types` directory
- **API Integration**: Complete backend integration with `lib/api/backend.ts`
- **Documentation**: Added CLAUDE.md files for all directories
- **Context Management**: Implemented Claude Code best practices

### Current Architecture State
```
📱 Frontend: React Native + Expo SDK 53
🗄️  Backend: MySQL REST API with JWT authentication
🔐 Auth: JWT tokens with AsyncStorage persistence
🎨 UI: NativeWind (Tailwind CSS for React Native)
🧭 Navigation: Expo Router file-based routing
🔗 Blockchain: Algorand tokenization + IPFS metadata
```

### Key Files & Their Purposes
- `lib/api/backend.ts` - Main API client for MySQL backend
- `lib/api/mappers.ts` - Type conversion between frontend/backend
- `lib/auth-service.ts` - JWT authentication service
- `contexts/AuthContext.tsx` - React Context for auth state
- `types/` - TypeScript interface definitions
- `hooks/scanner/` - Scanner business logic

### Critical Dependencies
```json
{
  "expo": "~53.0.0",
  "react-native": "0.75.0",
  "nativewind": "^4.0.1",
  "expo-router": "~4.0.0",
  "@react-native-async-storage/async-storage": "1.25.0"
}
```

### API Endpoints Structure
```
POST /auth/login - JWT authentication
POST /product/create - Tokenize products (Algorand + IPFS)
GET /product - List all products
POST /maintenance/create - Create maintenance records
GET /maintenance - List maintenance records
```

### Common Patterns Used
- Context-based state management (no external state library)
- Hook-based business logic extraction
- Modal-driven user interactions
- Type-safe API communication
- AsyncStorage for persistence

### Known Issues & Solutions
- ❌ HeadersInit TypeScript error → ✅ Use Record<string, string>
- ❌ Import path issues after type reorganization → ✅ Use @/types/* imports
- ❌ Unused import warnings → ✅ Clean up imports during development

---
**Last Updated**: Context management enhancement session
**Next Focus**: Advanced AI features implementation