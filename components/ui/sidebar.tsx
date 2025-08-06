import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useSegments, usePathname, Link, router } from 'expo-router';
import { useMediaQuery } from 'react-responsive';
import { Pressable, View, Text, ScrollView, Platform, Modal, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
// import { Sheet } from '@expo/universal-navigation'; // Supposons que Sheet est disponible ici ou similaire
import { X, Menu, Settings, User as UserIcon, Share2 } from 'lucide-react-native'; // Exemple d'icônes

// Définitions de types pour la flexibilité
type SidebarState = 'expanded' | 'collapsed' | 'offcanvas';

interface SidebarContextType {
  isOpen: boolean;
  openMobile: boolean;
  sidebarState: SidebarState;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 768 }); // Exemple pour détecter desktop
  const [isOpen, setIsOpen] = useState(isDesktop); // Commence ouvert sur desktop
  const [openMobile, setOpenMobile] = useState(false);
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

  // Récupérer l'état de la sidebar depuis les cookies au chargement
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedState = document.cookie.split('; ').find(row => row.startsWith('sidebar_state='))?.split('=')[1];
      if (savedState) {
        setSidebarState(savedState as SidebarState);
        setIsOpen(savedState === 'expanded');
      }
    }
  }, []);

  // Persister l'état de la sidebar dans les cookies
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.cookie = `sidebar_state=${sidebarState}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
  }, [sidebarState]);

  const toggleSidebar = useCallback(() => {
    setSidebarState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
    setIsOpen((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setOpenMobile((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    openMobile,
    sidebarState,
    toggleSidebar,
    toggleMobileSidebar,
    setSidebarState,
  }), [isOpen, openMobile, sidebarState, toggleSidebar, toggleMobileSidebar, setSidebarState]);

  // Hook pour le raccourci clavier (nécessite une implémentation web spécifique ou gestionnaire global)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
          event.preventDefault();
          toggleSidebar(); // Ceci est maintenant accessible
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [toggleSidebar]); // Ajout de toggleSidebar aux dépendances

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Composants de la Sidebar
export const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, openMobile, toggleMobileSidebar, sidebarState } = useSidebar();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Détection mobile basée sur la largeur de la fenêtre
  const { colors } = useTheme();

  if (isMobile) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={openMobile}
        onRequestClose={toggleMobileSidebar} // Pour gérer le bouton retour Android
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Contenu de la sidebar - maintenant à gauche */}
          <View style={{
            width: 288, // 18rem = 288px
            backgroundColor: colors.card, // Ou colors.background si préféré
            height: '100%',
            paddingTop: Platform.OS === 'android' ? 30 : 0, // Ajustement pour StatusBar Android
            borderRightWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
              <Pressable onPress={toggleMobileSidebar}>
                <X size={24} color={colors.text} />
              </Pressable>
            </View>
            {children}
          </View>
          
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={toggleMobileSidebar} />
        </View>
      </Modal>
    );
  }

  // Version Desktop
  return (
    <View
      style={{
        width: sidebarState === 'expanded' ? 256 : 48, // 16rem = 256px, 3rem = 48px
        backgroundColor: colors.card,
        height: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRightWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[colors.background, colors.background]} // Placeholder, ajustez au besoin
        style={{ flex: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

export const SidebarHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: colors.border }}>
      {children}
    </View>
  );
};

export const SidebarContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {children}
    </ScrollView>
  );
};

interface ProfileMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface SidebarFooterProps {
  userName?: string;
  userEmail?: string;
  userProfilePicture?: string;
  logoComponent?: React.ReactNode; // Pour le logo de la direction
  profileMenuItems?: ProfileMenuItem[]; // Nouvel prop pour les options du menu de profil
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  userName,
  userEmail,
  userProfilePicture,
  logoComponent,
  profileMenuItems = [], // Valeur par défaut vide
}) => {
  const { colors } = useTheme();
  const { sidebarState, toggleMobileSidebar, openMobile } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  // const { push } = useSegments(); // Ancien import incorrect
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean); // Divise par espace et filtre les chaînes vides
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  const handleProfileMenuToggle = () => {
    setProfileMenuVisible((prev) => !prev);
  };

  const handleProfileMenuItemPress = (href: string) => {
    router.push(href); // Utilisation de router.push
    setProfileMenuVisible(false); // Ferme le menu de profil
    if (openMobile) {
      toggleMobileSidebar(); // Ferme la sidebar mobile si ouverte
    }
  };

  return (
    <View style={{ padding: 16, borderTopWidth: 1, borderColor: colors.border }}>
      <Pressable onPress={handleProfileMenuToggle}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {userProfilePicture ? (
            <Image source={{ uri: userProfilePicture }} style={styles.profileImage} />
          ) : (
            <View style={[styles.initialsContainer, { backgroundColor: colors.primary }]}>
              <Text style={[styles.initialsText, { color: colors.background }]}>{initials}</Text>
            </View>
          )}
          {!isCollapsed && (
            <View style={{ marginLeft: 12 }}>
              {userName && <Text style={{ color: colors.text, fontWeight: 'bold' }}>{userName}</Text>}
              {userEmail && <Text style={{ color: colors.text, fontSize: 12 }}>{userEmail}</Text>}
            </View>
          )}
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isProfileMenuVisible}
        onRequestClose={handleProfileMenuToggle}
      >
        <Pressable style={styles.modalOverlay} onPress={handleProfileMenuToggle}>
          <View style={[styles.profileMenuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {profileMenuItems.map((item) => (
              <Pressable
                key={item.href}
                onPress={() => handleProfileMenuItemPress(item.href)}
                style={styles.profileMenuItem}
              >
                <item.icon size={20} color={colors.text} />
                <Text style={[styles.profileMenuItemText, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    borderWidth: 1,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  profileMenuItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

interface SidebarMenuProps {
  children: React.ReactNode;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ children }) => {
  return <View>{children}</View>;
};

interface SidebarMenuItemProps {
  children: React.ReactNode;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ children }) => {
  return <View style={{ marginBottom: 8 }}>{children}</View>;
};

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  tooltip?: string;
  asChild?: boolean; // Pour permettre de passer un Link ou un autre composant comme enfant
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({ children, isActive, tooltip, asChild }) => {
  const { colors } = useTheme();
  const { sidebarState, toggleMobileSidebar, openMobile } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Consistent with sidebar.tsx mobile detection

  const handlePress = () => {
    if (isMobile && openMobile) {
      toggleMobileSidebar();
    }
  };

  const buttonStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: isActive ? colors.primary : 'transparent',
  };

  const textStyle = {
    marginLeft: 10,
    color: isActive ? colors.background : colors.text,
    display: isCollapsed ? 'none' : 'flex',
  };

  const iconStyle = {
    color: isActive ? colors.background : colors.text,
  };

  return (
    <Pressable style={buttonStyle} onPress={handlePress}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === Link) {
            // Passe les props au Link pour qu'il gère la navigation
            return React.cloneElement(child, {
              style: { flexDirection: 'row', alignItems: 'center', width: '100%' },
              children: (
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  {React.Children.map(child.props.children, linkChild => {
                    if (React.isValidElement(linkChild)) {
                      if (linkChild.type === Text) {
                        return React.cloneElement(linkChild, { style: textStyle });
                      }
                      return React.cloneElement(linkChild, { color: iconStyle.color });
                    } else if (typeof linkChild === 'string' || typeof linkChild === 'number') {
                      return <Text style={textStyle}>{linkChild}</Text>;
                    }
                    return linkChild;
                  })}
                </View>
              )
            });
          }
          // Pour les autres enfants, ajuster le style si ce n'est pas un Link
          return React.cloneElement(child, { style: { ...child.props.style, ...textStyle } });
        } else if (typeof child === 'string' || typeof child === 'number') {
          return <Text style={textStyle}>{child}</Text>; // Envelopper le texte pour les enfants directs
        }
        return child;
      })}
      {isCollapsed && tooltip && (
        <View style={{ position: 'absolute', left: 50, backgroundColor: 'black', padding: 5, borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>{tooltip}</Text>
        </View>
      )}
    </Pressable>
  );
}; 