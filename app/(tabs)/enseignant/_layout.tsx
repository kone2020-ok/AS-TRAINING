import { Slot, usePathname, Link } from 'expo-router';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '../../../components/ui/sidebar';
import { Chrome as Home, FileText, ClipboardPlus, History, GraduationCap, FilePenLine, Archive, Wallet, User, Phone, Settings, Share2, LogOut, AlertTriangle, Briefcase } from 'lucide-react-native';
import { View, Text, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MobileHeaderWithSidebarToggle } from '../../../components/MobileHeaderWithSidebarToggle';
import { NotificationBell } from '../../../components/NotificationBell';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importez ce hook

// Placeholder for Logo component
const Logo = ({ className }: { className?: string }) => {
  return (
    <Image 
      source={require('../../../assets/images/img (22).jpg')} 
      style={{ width: 32, height: 32, borderRadius: 16 }}
      resizeMode="contain"
    />
  );
};

export default function EnseignantTabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Détection desktop
  const insets = useSafeAreaInsets(); // Initialisez le hook

  const userRole = 'enseignant';

  const menuItems = [
    { href: '/enseignant', label: 'Accueil', icon: Home },
    { href: '/enseignant/contracts', label: 'Mes Contrats', icon: FileText },
    { href: '/enseignant/sessions', label: 'Mes Séances', icon: ClipboardPlus },
    { href: '/enseignant/sessions-history', label: 'Historique', icon: History },
    { href: '/enseignant/salary', label: 'Mon Salaire', icon: Wallet },
    { href: '/enseignant/market-offers', label: 'Offres', icon: Briefcase },
    { href: '/enseignant/absences', label: 'Signalement d\'absence', icon: AlertTriangle },
    // Fonctionnalités masquées temporairement pour la version d'urgence
    // { href: '/enseignant/grades', label: 'Notes', icon: GraduationCap },
    // { href: '/enseignant/reports', label: 'Rapports', icon: FilePenLine },
    // { href: '/enseignant/bulletins', label: 'Bulletins', icon: Archive },
    // { href: '/enseignant/profile', label: 'Mon Profil', icon: User },
    // { href: '/enseignant/contact', label: 'Contacts', icon: Phone },
  ];

  const profileMenuItems = [
    { label: 'Paramètres', href: '/enseignant/settings', icon: Settings },
    { label: 'Profil', href: '/enseignant/profile', icon: User },
    { label: 'Partager', href: '/enseignant/share', icon: Share2 },
    { label: 'Déconnexion', href: '/(auth)/login', icon: LogOut },
  ];

  return (
    <SidebarProvider>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar>
          <SidebarHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Logo />
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>ASTRA Manager</Text>
            </View>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== '/enseignant' && pathname.startsWith(item.href))
                    }
                    tooltip={item.label}
                  >
                    <Link href={item.href as any}>
                      <item.icon size={20} color={colors.text} />
                      <Text>{item.label}</Text>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter
            userName="KOUAME Boris"
            userEmail="boris.kouame@example.com"
            profileMenuItems={profileMenuItems}
            // userProfilePicture="https://example.com/boris.jpg" // Décommenter si vous avez une URL de photo réelle
          />
        </Sidebar>

        <View style={{ flex: 1 }}>
          {/* Mobile Header, toujours visible en haut pour la nav mobile */}
          <MobileHeaderWithSidebarToggle title="Enseignant" />

          {/* La cloche de notification positionnée de manière absolue */}
          <View style={{
            position: 'absolute',
            top: insets.top + 5, // Ajustez le padding top selon la safe area
            right: 10,
            zIndex: 999, // Assurez-vous qu'elle est au-dessus du contenu
          }}>
            <NotificationBell userRole={userRole} />
          </View>

          {/* Le contenu de la page, avec un padding pour éviter la superposition avec la cloche */}
          <View style={{ flex: 1, paddingTop: isDesktop ? 0 : 50 + insets.top }}>
            <Slot />
          </View>
        </View>
      </View>
    </SidebarProvider>
  );
}