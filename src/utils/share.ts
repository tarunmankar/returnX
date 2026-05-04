import { Share } from 'react-native';

export const shareToWhatsApp = async (title: string, details: string[]) => {
  try {
    const message = `📊 *ReturnX - ${title}*\n\n${details.join('\n')}\n\n_Calculated via ReturnX Nivesh App_`;
    await Share.share({ message });
  } catch (error) {
    console.error('Error sharing', error);
  }
};
