import { YStack, useToastController } from '@cai/ui'
import { capitalizeWord } from '@cai/ui/src/libs/string'
import { SignUpSignInComponent } from 'app/features/sign-in/SignUpSignIn'
import { signIn, signUp } from 'app/utils/auth/client'
import { getInitialURL } from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'solito/router'

type OAuthProvider = 'google' | 'github'

export const SignUpScreen = (): React.ReactNode => {
  const { push } = useRouter()
  const toast = useToastController()

  const handleOAuthSignInWithPress = async (provider: OAuthProvider) => {
    try {
      const redirectUri = (await getInitialURL()) || 'cai://'
      
      // Open OAuth flow in browser
      const response = await WebBrowser.openAuthSessionAsync(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/${provider}?redirect=${encodeURIComponent(redirectUri)}`,
        redirectUri
      )
      
      if (response.type === 'success') {
        // The auth flow completed successfully
        push('/')
      }
    } catch (error) {
      toast.show(`${capitalizeWord(provider)} sign up failed`, {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      console.log('OAuth Sign up failed', error)
    } finally {
      WebBrowser.maybeCompleteAuthSession()
    }
  }

  const handleEmailSignUpWithPress = async (email: string, password: string) => {
    try {
      const { data, error } = await signUp.email({
        email,
        password,
      })
      
      if (error) {
        console.log('error', error)
        toast.show('Sign up failed', {
          message: error.message,
        })
      } else if (data) {
        toast.show('Email Confirmation', {
          message: 'Check your email',
        })
        push('/')
      }
    } catch (error) {
      toast.show('Sign up failed', {
        message: error instanceof Error ? error.message : 'An error occurred',
      })
    }
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <SignUpSignInComponent
        type='sign-up'
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignUpWithPress}
      />
    </YStack>
  )
}