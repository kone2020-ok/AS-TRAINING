import React from 'react';
import { View, Pressable, Text, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useSidebar } from './ui/sidebar';
// import { NotificationBell } from './NotificationBell'; // Ne plus importer ici

interface MobileHeaderWithSidebarToggleProps {
  title: string;
  // userRole: 'enseignant' | 'parent' | 'direction'; // userRole n'est plus nécessaire ici
}

export const MobileHeaderWithSidebarToggle: React.FC<MobileHeaderWithSidebarToggleProps> = ({ title /*, userRole*/ }) => {
  const { toggleMobileSidebar } = useSidebar();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!isMobile) {
    return null;
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        <Pressable onPress={toggleMobileSidebar} style={{marginRight: 16}}>
          <Menu size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1 }}>{title}</Text>
        {/* <NotificationBell userRole={userRole} /> */}
      </View>
    </SafeAreaView>
  );
}; 