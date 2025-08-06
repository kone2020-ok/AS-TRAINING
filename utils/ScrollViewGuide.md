# Guide du Style de Défilement Uniforme

## 🎯 Objectif
Standardiser le style de défilement sur toutes les pages de l'application AS-TRAINING avec des couleurs spécifiques par rôle.

## 🎨 Couleurs par Rôle

### Direction (Bleu)
- Header: `['#1E40AF', '#3B82F6']`
- Utilisé pour: Gestion, supervision, analytics

### Enseignant (Vert)
- Header: `['#059669', '#10B981']`
- Utilisé pour: Notes, bulletins, séances

### Parent (Orange)
- Header: `['#EA580C', '#F97316']`
- Utilisé pour: Consultation, suivi enfants

## 📋 Structure Standard

```typescript
// 1. Variables d'animation
const [fadeAnim] = useState(new Animated.Value(0));
const [slideAnim] = useState(new Animated.Value(30));

// 2. Responsive
const { width } = useWindowDimensions();
const isDesktop = width >= 768;

// 3. Animations dans useEffect
useEffect(() => {
  // Animations
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }),
  ]).start();
}, []);

// 4. Structure du rendu
return (
  <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
    {/* Fixed Header */}
    <LinearGradient colors={getHeaderColors()} style={styles.fixedHeader}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
    </LinearGradient>

    {/* Scrollable Content */}
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { 
        opacity: fadeAnim, 
        paddingHorizontal: isDesktop ? 20 : 12 
      }]}>
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { 
          backgroundColor: '#FFFFFF', 
          borderBottomColor: '#E5E7EB', 
          marginHorizontal: isDesktop ? -20 : -12 
        }]}>
          <Text style={[styles.welcomeTitle, { color: '#1F2937' }]}>{title}</Text>
          <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>{subtitle}</Text>
        </View>
        
        {/* Contenu de la page */}
        {children}
      </Animated.View>
    </ScrollView>
  </View>
);
```

## 🚀 Pages Améliorées

### ✅ Direction
- **Accueil** (`index.tsx`) - Style parfait
- **Enseignants** (`teachers.tsx`) - Style parfait
- **Parents** (`parents.tsx`) - Style parfait
- **Contrats** (`contracts.tsx`) - Style parfait
- **Séances** (`sessions.tsx`) - Style parfait
- **Grades** (`grades.tsx`) - ✅ Animations ajoutées
- **Contact** (`contact.tsx`) - ✅ Animations ajoutées
- **Bulletins** (`bulletins.tsx`) - ✅ Structure améliorée

### 🔄 Enseignant
- **Grades** (`grades.tsx`) - ✅ Animations ajoutées

### 🔄 Parent
- **Grades & Bulletins** (`grades-reports.tsx`) - ✅ Animations ajoutées

## 📝 Prochaines Étapes

### Pages Direction restantes:
- [ ] **Facturation** (`invoicing.tsx`)
- [ ] **Paiements** (`payments.tsx`)
- [ ] **Finance** (`finance.tsx`)
- [ ] **Rapports Enseignants** (`teacher-reports.tsx`)
- [ ] **Rapports Parents** (`parent-reports.tsx`)

### Pages Enseignant:
- [ ] **Bulletins** (`bulletins.tsx`)
- [ ] **Rapports** (`reports.tsx`)
- [ ] **Séances** (`sessions.tsx`)
- [ ] **Contrats** (`contracts.tsx`)

### Pages Parent:
- [ ] **QR Code** (`qr-code.tsx`)
- [ ] **Contrats** (`contracts.tsx`)
- [ ] **Séances** (`lessons-log.tsx`)
- [ ] **Factures** (`invoices.tsx`)
- [ ] **Rapports** (`monthly-reports.tsx`)

## 🛠️ Utilisation du Template

```typescript
import { ScrollViewTemplate } from '../../../utils/ScrollViewTemplate';

// Dans votre composant
const [fadeAnim] = useState(new Animated.Value(0));
const [slideAnim] = useState(new Animated.Value(30));

return (
  <ScrollViewTemplate 
    title="Titre de la page"
    fadeAnim={fadeAnim}
    slideAnim={slideAnim}
    userRole="direction" // ou "enseignant" ou "parent"
    onBack={() => router.back()}
  >
    {/* Votre contenu ici */}
  </ScrollViewTemplate>
);
```

## 🎯 Avantages

1. **Cohérence visuelle** - Même style sur toutes les pages
2. **Couleurs par rôle** - Identification claire des utilisateurs
3. **Animations fluides** - Expérience utilisateur améliorée
4. **Responsive design** - Adaptation desktop/mobile
5. **Maintenance facile** - Template centralisé 