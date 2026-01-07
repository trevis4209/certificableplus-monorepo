# Current Development Context

**⚡ Quick Session Reference for Claude Code**

## 🎯 Current Project State

**App Type**: React Native + Expo industrial signage management
**Backend**: MySQL with REST API + JWT authentication
**Key Features**: QR scanner, product management, maintenance tracking, blockchain tokenization

## 📋 Essential Context

### Architecture Stack
- **Frontend**: React Native + Expo SDK 53 + NativeWind (Tailwind)
- **Backend**: MySQL database with REST API endpoints
- **Auth**: JWT tokens with AsyncStorage persistence
- **Blockchain**: Algorand tokenization + IPFS metadata
- **Navigation**: Expo Router file-based routing

### Key API Endpoints
- `POST /product/create` - Tokenize products on blockchain
- `GET /product` - List all products
- `POST /maintenance/create` - Create maintenance records
- `GET /maintenance` - List maintenances
- `POST /auth/login` - JWT authentication

### Current Session Focus
- [x] **Working on**: Context management enhancements and Claude Code best practices
- [x] **Last changed files**: CLAUDE.md files (all directories), .claudeignore, CONTEXT.md, backend integration
- [ ] **Next steps**: Implement advanced AI context features (hooks, memory, agents)

## 🚨 Critical Reminders

### Before ANY Code Changes
1. **Read directory CLAUDE.md first**: Each directory has specific guidelines
2. **Follow type safety**: All code must use proper TypeScript types
3. **Test backend integration**: Ensure API calls work with MySQL backend
4. **Check authentication**: Verify JWT token handling works correctly

### Code Quality Gates
- ✅ TypeScript: No `any` types, complete interfaces
- ✅ Performance: React.memo for expensive components
- ✅ Security: No hardcoded credentials, proper input validation
- ✅ Testing: Test critical paths, especially scanner operations

## 📚 Quick Reference

### File Organization
```
/app         → Pages and routing (read /app/CLAUDE.md)
/components  → UI components (read /components/CLAUDE.md)
/hooks       → Business logic (read /hooks/CLAUDE.md)
/lib         → Services & API (read /lib/CLAUDE.md)
/types       → TypeScript types (read /types/CLAUDE.md)
```

### Common Commands
```bash
# Development
npx expo start                 # Start development server
npm run lint                   # Check code quality

# Testing
npx expo start --clear        # Clear cache
npx expo install --fix        # Fix package issues
```

### Backend Integration Checklist
- [ ] API calls use proper authentication headers
- [ ] Types match backend response format (check /types/api-response.ts)
- [ ] Error handling for network failures
- [ ] GPS coordinates formatted correctly (6 decimals, max 9 digits)

## 🔄 Session Workflow

### Starting New Feature
1. Update "Working on" section above
2. Check relevant directory CLAUDE.md files
3. Plan types first in `/types`
4. Implement business logic in `/hooks` or `/lib`
5. Create UI components following design system
6. Test with real backend integration

### Code Review Checklist
- [ ] Follows patterns in directory CLAUDE.md
- [ ] Uses proper TypeScript types
- [ ] No hardcoded API URLs or credentials
- [ ] Proper error handling and loading states
- [ ] Consistent with existing code style

---
**💡 Tip**: Use `/clear` command frequently to reset Claude's context between different features or major task changes.