import { StyleSheet, Text, type TextProps } from 'react-native'
import { useThemeColor } from '@/src/hooks/use-theme-color'

export type ThemedTextProps = TextProps & {
  themeColor?: 'light' | 'dark';
  type?: 'normal' | 'title' | 'subtitle' | 'regular' | 'defaultSemiBold' | 'link';
};

export function ThemedText({
  style,
  themeColor,
  type = 'normal',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({}, 'text')

  return (
    <Text
      style={[
        { color },
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'normal' ? styles.normal : undefined,
        type === 'regular' ? styles.regular : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  normal: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 24,
  },
  link: {
    lineHeight: 20,
    fontSize: 18,
    textDecorationLine: 'underline',
  },
  regular: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
  },
});
