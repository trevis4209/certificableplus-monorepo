# Certificable Plus - Comprehensive Screen Planning Document

## 1. Application Overview & User Roles

### Core Functionality
Certificable Plus is a web/mobile application for managing, tracking, and maintaining certified devices (road signs, technical signage) using QR Code or NFC technology.

### User Roles & Access Levels
- **Azienda (Company)**: Full management access - products, employees, maintenance, database
- **Dipendente (Employee)**: Operational access - add products, maintenance, view database
- **Visualizzatore (Viewer)**: Read-only access - database and map viewing only

## 2. Complete Screen Inventory

### Authentication Screens
1. **Login Screen** - User authentication
2. **Registration Screen** - New user/company registration
3. **Password Reset Screen** - Password recovery flow

### Dashboard Screens
4. **Home Azienda** - Company dashboard with full management controls
5. **Home Dipendente** - Employee dashboard with operational tools
6. **Home Visualizzatore** - Viewer dashboard with read-only access

### Product Management Screens
7. **Add Product Form/Modal** - Create new product entries
8. **Product Detail View** - Individual product information and history
9. **Product Edit Form** - Modify existing product data

### Employee Management Screens
10. **Add Employee Modal** - Company role only - add new employees
11. **Employee List View** - Manage employee accounts
12. **Employee Profile Edit** - Individual employee management

### Maintenance Screens
13. **Add Maintenance Form/Modal** - Record maintenance activities
14. **QR/NFC Scanning Interface** - Device identification for maintenance
15. **Maintenance History View** - Chronological maintenance records

### Data Views
16. **Database Table View** - Tabular data display with filtering
17. **Interactive Map View** - Geolocation-based product visualization
18. **Export/Import Interface** - Data management tools

### Profile & Settings
19. **User Profile Screen** - Personal account management
20. **Company Settings** - Organization-level configurations
21. **App Settings** - Application preferences

## 3. Detailed Screen Specifications

### 3.1 Authentication Screens

#### Login Screen
**Layout Structure:**
```
[App Logo/Branding]
[Company Name Input]
[Username/Email Input]
[Password Input]
[Remember Me Checkbox]
[Login Button - Primary]
[Forgot Password Link]
[Register New Company Link]
```

**Component Hierarchy:**
- Header: Logo + App Title
- Main Form Container
  - Input Group: Company Identifier
  - Input Group: User Credentials
  - Action Group: Login Controls
- Footer: Registration Links

**Interactive Elements:**
- Form validation on blur and submit
- Password visibility toggle
- Remember me functionality
- Redirect based on user role after authentication

**Data Requirements:**
- Company ID/Name
- Username/Email
- Password
- User role and permissions

**Mobile Considerations:**
- Large touch targets (minimum 48px)
- Auto-focus on first input
- Native keyboard optimization
- Biometric login support where available

#### Registration Screen
**Layout Structure:**
```
[Back Navigation]
[Registration Progress Indicator]
[Company Information Section]
[Admin User Creation Section]
[Terms & Conditions]
[Submit Button]
```

**Component Breakdown:**
- Multi-step form with progress indication
- Company details: Name, VAT, Address
- Admin user: Name, Email, Password
- Legal compliance checkboxes

### 3.2 Dashboard Screens

#### Home Azienda (Company Dashboard)
**Layout Structure:**
```
[Header: Logo + Company Name + Profile Menu]
[Sidebar Navigation]
[Main Action Grid - 2x2 on mobile, 4x1 on desktop]
├── Add Product (Red)
├── Add Employee (Blue)  
├── View Database (Green)
└── Add Maintenance (Purple)
[Quick Stats Cards]
[Recent Activity Feed]
```

**Component Hierarchy:**
- App Header
  - Logo/Branding
  - Company Name Display
  - User Profile Dropdown
- Sidebar Navigation (collapsible on mobile)
  - Home
  - Profile
  - Settings
  - Logout
- Main Content Area
  - Primary Action Grid
  - Dashboard Statistics
  - Activity Timeline

**Interactive Elements:**
- Color-coded action buttons with large touch targets
- Expandable stats cards
- Scrollable activity feed
- Responsive sidebar collapse/expand

**Data Requirements:**
- Company information
- User permissions
- Dashboard statistics (product count, employee count, recent activities)
- Activity timeline data

**Responsive Behavior:**
- Mobile: Stack action buttons vertically, hide sidebar by default
- Tablet: 2x2 grid layout, persistent sidebar
- Desktop: 4x1 grid layout, expanded sidebar

#### Home Dipendente (Employee Dashboard)
**Layout Structure:**
```
[Header: Logo + User Name]
[Main Action Buttons - Stacked on mobile]
├── Add Product (Red)
├── Add Maintenance (Purple)
└── View Database (Green)
[Quick Access QR Scanner]
[Footer Navigation]
├── Home
└── Profile
```

**Simplified Design Principles:**
- Maximum 2-step actions for all operations
- Large, easily tappable buttons
- Minimal navigation options
- Focus on operational tasks

**Mobile-First Optimizations:**
- Thumb-friendly button placement
- High contrast color scheme
- Large typography for outdoor use
- Quick scanner access

### 3.3 Product Management Screens

#### Add Product Form/Modal
**Layout Structure:**
```
[Modal Header: Title + Close]
[Form Sections with Progressive Disclosure]
├── Basic Information
│   ├── Signal Type (Dropdown)
│   ├── Year (Number Input)
│   └── Form/Shape (Dropdown)
├── Technical Specifications
│   ├── Support Material (Text)
│   ├── Support Thickness (Number)
│   ├── WL Code (Text)
│   └── Fixing Method (Text)
├── Physical Properties
│   ├── Dimensions (Text)
│   └── Film Material (Text)
└── Documentation
    └── Image Upload (Gallery/Camera)
[Save Button] [Cancel Button]
```

**Component Breakdown:**
- Modal Container with backdrop
- Progressive Form Sections
- Dynamic Input Components
- Image Upload with preview
- Form Validation Display
- Action Button Group

**Interactive Elements:**
- Collapsible form sections
- Dynamic dropdowns based on signal type
- Drag-and-drop image upload
- Real-time form validation
- Auto-save draft functionality

**Data Requirements:**
- Signal type taxonomy
- Material specifications database
- Image storage and processing
- Form validation rules

**Mobile Considerations:**
- Full-screen modal on small devices
- Native camera integration
- Touch-optimized file selection
- Keyboard-aware scrolling

#### Product Detail View
**Layout Structure:**
```
[Header: Product ID + Actions Menu]
[Product Image Gallery]
[Technical Specifications Grid]
[QR/NFC Code Display]
[Location Map Preview]
[Maintenance History Timeline]
[Action Buttons: Edit, Add Maintenance, Generate Report]
```

### 3.4 Maintenance Screens

#### QR/NFC Scanning Interface
**Layout Structure:**
```
[Header: Scan Product]
[Camera Viewfinder with Overlay]
[Scan Status Indicator]
[Manual Product ID Input]
[Recent Scans List]
```

**Component Breakdown:**
- Camera Component with QR/NFC detection
- Visual scan indicators
- Fallback manual input
- Scan history management

**Interactive Elements:**
- Real-time camera preview
- Scan result confirmation
- Product quick preview after scan
- Manual search functionality

#### Add Maintenance Form/Modal
**Layout Structure:**
```
[Product Information Header]
[Maintenance Type Selection]
├── Installation
├── Maintenance  
├── Replacement
├── Verification
└── Decommission
[Notes Text Area]
[Photo Upload Section]
[Auto-filled Information]
├── Date/Time
├── User ID
└── GPS Location
[Submit Button]
```

**Auto-completion Features:**
- Timestamp auto-fill
- User identification
- GPS coordinates
- Weather conditions (if relevant)

### 3.5 Data Views

#### Database Table View
**Layout Structure:**
```
[Search and Filter Header]
├── Search Input
├── Filter Dropdowns (Type, Date, Status)
└── Export Button
[Data Table with Sorting]
[Pagination Controls]
[Bulk Action Controls]
```

**Component Breakdown:**
- Advanced Search Interface
- Sortable Data Table
- Filter Panel (collapsible)
- Export Controls
- Pagination Component

**Interactive Elements:**
- Column sorting
- Row selection
- Inline editing
- Bulk operations
- Export format selection

#### Interactive Map View
**Layout Structure:**
```
[Map Controls Overlay]
├── Filter Panel Toggle
├── Search Location
└── Map Style Selector
[Full-Screen Map]
├── Product Markers (Color-coded by status)
├── Cluster Groups for Dense Areas
└── Info Popups on Click
[Legend and Map Info]
```

**Marker Color Coding:**
- Green: Recently maintained
- Yellow: Maintenance due
- Red: Urgent attention needed
- Gray: Decommissioned

## 4. User Journey Mapping

### 4.1 Employee Daily Workflow
```
1. Login → Home Dipendente
2. Select "Add Maintenance"
3. Scan QR Code → Product Identified
4. Select Maintenance Type → Fill Notes → Upload Photos
5. Submit → Confirmation → Return to Home
```

### 4.2 Company Manager Product Creation
```
1. Login → Home Azienda  
2. Select "Add Product"
3. Fill Product Details → Upload Images
4. Save → QR Code Generated → Print/Associate
5. Product Active in Database
```

### 4.3 Viewer Query Workflow  
```
1. Login → Database View
2. Apply Filters → Search Products
3. Select Product → View Details
4. View Map Location → Check Maintenance History
```

## 5. Component Breakdown

### 5.1 Core UI Components

#### Action Button Component
- **Props**: color, icon, text, size, disabled state
- **Variants**: primary, secondary, danger
- **Mobile**: Minimum 48px height, large typography
- **Desktop**: Smaller sizing, hover states

#### Form Input Component
- **Types**: text, number, select, upload, textarea
- **Features**: validation, auto-complete, error states
- **Mobile**: Large touch targets, native input types
- **Accessibility**: Labels, ARIA attributes, keyboard navigation

#### Modal Component
- **Behavior**: Overlay with backdrop, focus management
- **Mobile**: Full-screen on small devices
- **Desktop**: Centered overlay with max-width
- **Features**: Close on backdrop, keyboard shortcuts

#### Data Table Component
- **Features**: Sorting, filtering, pagination, selection
- **Mobile**: Horizontal scroll, condensed view
- **Desktop**: Full table with all columns
- **Export**: CSV, XLS format support

### 5.2 Specialized Components

#### QR/NFC Scanner Component
- **Integration**: Camera API, QR detection libraries
- **Fallback**: Manual product ID input
- **Feedback**: Visual and audio scan confirmation
- **Error Handling**: Invalid codes, permission denied

#### Map Component
- **Provider**: Google Maps or Leaflet integration
- **Features**: Markers, clustering, info windows
- **Controls**: Zoom, layer selection, search
- **Mobile**: Touch gestures, location services

#### Image Upload Component
- **Sources**: Camera, file system, gallery
- **Processing**: Resize, compression, format conversion
- **Preview**: Thumbnail generation, crop functionality
- **Storage**: Cloud integration, local caching

## 6. Navigation Flow Architecture

### 6.1 Primary Navigation Structure
```
Authentication Layer
├── Login
├── Registration  
└── Password Reset

Main Application
├── Dashboard (Role-based)
│   ├── Azienda Home
│   ├── Dipendente Home
│   └── Visualizzatore Home
├── Product Management
│   ├── Add Product
│   ├── Product Details
│   └── Edit Product
├── Maintenance Operations
│   ├── QR/NFC Scanner
│   ├── Add Maintenance
│   └── Maintenance History
├── Data Views
│   ├── Database Table
│   ├── Interactive Map
│   └── Export Tools
└── User Management
    ├── Profile Settings
    ├── Company Settings (Azienda only)
    └── Employee Management (Azienda only)
```

### 6.2 Navigation Patterns

#### Desktop Navigation
- Persistent sidebar navigation
- Breadcrumb navigation for deep screens
- Tab-based navigation for related content
- Context menus for quick actions

#### Mobile Navigation
- Bottom tab bar for primary sections
- Hamburger menu for secondary options
- Swipe gestures for modal dismissal
- Back button consistency

#### Modal Navigation
- Step-by-step forms with progress indicators
- Cancel/save actions always visible
- Auto-save for lengthy forms
- Exit confirmation for unsaved changes

## 7. Responsive Design Strategy

### 7.1 Breakpoint Strategy
- **Mobile**: 320px - 767px (Primary target)
- **Tablet**: 768px - 1023px (Secondary)
- **Desktop**: 1024px+ (Enhanced experience)

### 7.2 Mobile-First Approach

#### Touch Target Specifications
- Minimum 48px x 48px for interactive elements
- 8px minimum spacing between touch targets
- Large button text (16px minimum)
- High contrast color ratios (4.5:1 minimum)

#### Field Work Optimizations
- Glove-friendly interface design
- High visibility in outdoor lighting
- Simplified workflows (max 2 steps)
- Large typography for readability
- Voice input where appropriate

#### Offline Considerations
- Local data caching
- Sync queue for offline actions
- Visual indicators for sync status
- Graceful degradation without connectivity

### 7.3 Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced interactions with JavaScript enabled
- PWA capabilities for mobile installation
- Background sync for data updates

## 8. Data Requirements & State Management

### 8.1 Data Models

#### User Data
- Authentication credentials
- Role and permissions
- Company association
- Profile information

#### Product Data
- Technical specifications
- Images and documentation
- QR/NFC associations
- Location coordinates
- Status and lifecycle

#### Maintenance Data
- Activity records
- User assignments
- Timestamps and locations
- Photo documentation
- Status updates

### 8.2 State Management Strategy

#### Client-Side State
- User authentication state
- Form data and validation
- UI state (modals, filters)
- Offline data queue

#### Server Synchronization
- Real-time updates for collaborative features
- Batch uploads for offline scenarios
- Conflict resolution strategies
- Data versioning for audit trails

## 9. Performance & Loading States

### 9.1 Loading State Design
- Skeleton screens for content areas
- Progressive image loading
- Chunked data loading for large datasets
- Optimistic UI updates

### 9.2 Error State Handling
- Network connectivity issues
- Authentication failures
- Form validation errors
- Data synchronization conflicts

### 9.3 Success State Feedback
- Action confirmation modals
- Toast notifications for quick actions
- Progress indicators for long operations
- Visual feedback for completed tasks

## 10. Accessibility & Internationalization

### 10.1 Accessibility Requirements
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode support
- Voice command integration

### 10.2 Internationalization Considerations
- Multi-language support framework
- RTL layout compatibility
- Cultural color associations
- Local date/time formats
- Currency and unit formatting

This comprehensive screen planning document provides the foundation for implementing Certificable Plus with a focus on mobile-first design, operational efficiency, and role-based access control. Each screen specification includes detailed component breakdowns, interaction patterns, and responsive considerations to ensure consistent user experience across all devices and use cases.