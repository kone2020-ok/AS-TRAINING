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
import { Chrome as Home, QrCode, FileText, History, Wallet, Archive, FilePenLine, User, Phone, Settings, Share2, LogOut, AlertTriangle } from 'lucide-react-native';
import { View, Text, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MobileHeaderWithSidebarToggle } from '../../../components/MobileHeaderWithSidebarToggle';
import { NotificationBell } from '../../../components/NotificationBell';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function ParentTabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Détection desktop
  const insets = useSafeAreaInsets();

  const userRole = 'parent'; // Définir le rôle pour ce layout

  const menuItems = [
    { href: '/parent', label: 'Accueil', icon: Home },
    { href: '/parent/qr-code', label: 'QR Code', icon: QrCode },
    { href: '/parent/contracts', label: 'Mes Contrats', icon: FileText },
    { href: '/parent/lessons-log', label: 'Journal Séances', icon: History },
    { href: '/parent/invoices', label: 'Factures', icon: Wallet },
    { href: '/parent/absences', label: 'Signalements', icon: AlertTriangle },
    // Fonctionnalités masquées temporairement pour la version d'urgence
    // { href: '/parent/grades-reports', label: 'Notes & Bulletins', icon: Archive },
    // { href: '/parent/monthly-reports', label: 'Mes Avis', icon: FilePenLine },
    // { href: '/parent/profile', label: 'Profil', icon: User },
    // { href: '/parent/contact', label: 'Contacts', icon: Phone },
  ];

  const profileMenuItems = [
    { label: 'Paramètres', href: '/parent/settings', icon: Settings },
    { label: 'Profil', href: '/parent/profile', icon: User },
    { label: 'Partager', href: '/parent/share', icon: Share2 },
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
                      (item.href !== '/parent' && pathname.startsWith(item.href))
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
            userName="TRAORE Aminata"
            userEmail="aminata.traore@example.com"
            profileMenuItems={profileMenuItems}
            // userProfilePicture="https://example.com/aminata.jpg" // Décommenter si vous avez une URL de photo réelle
          />
        </Sidebar>

        <View style={{ flex: 1 }}>
          {/* Mobile Header, toujours visible en haut pour la nav mobile */}
          <MobileHeaderWithSidebarToggle title="Parent" />

          {/* La cloche de notification positionnée de manière absolue */}
          <View style={{
            position: 'absolute',
            top: insets.top + 5,
            right: 10,
            zIndex: 999,
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