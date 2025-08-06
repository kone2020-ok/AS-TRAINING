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
import { Chrome as Home, Briefcase, Users, FilePenLine, CircleCheck as CheckCircle, FileText, GraduationCap, Archive, CreditCard, BookUser, Settings, Share2, User, LogOut, Calculator, AlertTriangle, Camera } from 'lucide-react-native';
import { View, Text, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MobileHeaderWithSidebarToggle } from '../../../components/MobileHeaderWithSidebarToggle';
import { NotificationBell } from '../../../components/NotificationBell';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { initializeNotificationSystem } from '../../../services/NotificationInitializer';

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

export default function DirectionTabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Détection desktop
  const insets = useSafeAreaInsets();

  const userRole = 'direction';
  const userId = 'direction_admin'; // ID unique pour la direction

  // Initialiser le système de notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await initializeNotificationSystem();
        console.log('🔔 Système de notifications initialisé pour la direction');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des notifications:', error);
      }
    };

    initNotifications();
  }, []);

  const menuItems = [
    { href: '/direction', label: 'Accueil', icon: Home },
    { href: '/direction/teachers', label: 'Enseignants', icon: Briefcase },
    { href: '/direction/parents', label: 'Parents', icon: Users },
    { href: '/direction/contracts', label: 'Contrats', icon: FilePenLine },
    { href: '/direction/sessions', label: 'Séances', icon: CheckCircle },
    { href: '/direction/invoicing', label: 'Facturation', icon: FileText },
    { href: '/direction/payments', label: 'Paiements', icon: CreditCard },
    { href: '/direction/market-offers', label: 'Offres', icon: Briefcase },
    { href: '/direction/absences', label: 'Signalement d\'absence', icon: AlertTriangle },
    { href: '/direction/photo-approvals', label: 'Approbation', icon: Camera },
    // Fonctionnalités masquées temporairement pour la version d'urgence
    // { href: '/direction/teacher-reports', label: 'Rapports Ens.', icon: FileText },
    // { href: '/direction/parent-reports', label: 'Rapports Parents', icon: FileText },
    // { href: '/direction/grades', label: 'Notes', icon: GraduationCap },
    // { href: '/direction/bulletins', label: 'Bulletins', icon: Archive },
    // { href: '/direction/finance', label: 'Comptabilité', icon: Calculator },
    // { href: '/direction/contact', label: 'Contacts', icon: BookUser },
  ];

  const profileMenuItems = [
    { label: 'Paramètres', href: '/direction/settings', icon: Settings },
    { label: 'Profil', href: '/direction/profile', icon: User },
    { label: 'Partager', href: '/direction/share', icon: Share2 },
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
                      (item.href !== '/direction' && pathname.startsWith(item.href))
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
            userName="Direction AS-TRAINING"
            userEmail="groupeas.infos@yahoo.fr"
            profileMenuItems={profileMenuItems}
            // userProfilePicture="https://example.com/astra_logo.png" // Décommenter si vous avez une URL de logo/photo réelle
      />
        </Sidebar>

        <View style={{ flex: 1 }}>
          {/* Mobile Header, toujours visible en haut pour la nav mobile */}
          <MobileHeaderWithSidebarToggle title="Direction" />

          {/* La cloche de notification positionnée de manière absolue */}
          <View style={{
            position: 'absolute',
            top: insets.top + 5,
            right: 10,
            zIndex: 999,
          }}>
            <NotificationBell userRole={userRole} userId={userId} />
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