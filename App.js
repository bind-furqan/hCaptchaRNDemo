/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useRef} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

// HCaptcha Constants
const siteKey = '544c8578-fe64-4b00-bcf3-6044a8a9d26d';
const baseUrl = 'https://hcaptcha.com';

const App: () => Node = () => {
  const [hCaptchaToken, setHCaptchaToken] = useState(null);
  const [hCaptchaStatus, setHCaptchaStatus] = useState(null);

  const [verifyHCaptchaTokenResponse, setVerifyHCaptchaTokenResponse] =
    useState(null);

  const captchaForm = useRef();

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const messageEvent = event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        console.log('failure HCaptcha Data : ', event.nativeEvent.data);
        if (!hCaptchaStatus) {
          setHCaptchaStatus(event.nativeEvent.data);
        }
        return;
      } else {
        console.log('Verified code from hCaptcha', event.nativeEvent.data);
        setHCaptchaStatus('success');
        setHCaptchaToken(event.nativeEvent.data); // set HCaptcha Token
        return setTimeout(() => {
          captchaForm.current.hide();
          // do whatever you want here
        }, 1000);
      }
    }
  };

  const verifyHCaptchaToken = async hCaptchaToken => {
    try {
      const response = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: hCaptchaToken,
        }),
      });
      const json = await response.json();
      console.log('Verify HCaptcha Response : ', json);
      setVerifyHCaptchaTokenResponse(json);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <ConfirmHcaptcha
            baseUrl={baseUrl}
            languageCode="en"
            onMessage={messageEvent}
            showLoading={true}
            loadingIndicatorColor={'white'}
            ref={captchaForm}
            siteKey={siteKey}
          />
          {!hCaptchaToken && (
            <TouchableOpacity
              onPress={() => {
                captchaForm.current.show();
              }}>
              <Text style={styles.button}>Start HCaptcha</Text>
            </TouchableOpacity>
          )}
          {hCaptchaStatus && (
            <Text style={{margin: 10}}>
              {'HCaptcha status: '}
              <Text
                style={{
                  color: 'darkviolet',
                  fontWeight: 'bold',
                }}>
                {hCaptchaStatus}
              </Text>
            </Text>
          )}
          {hCaptchaToken && (
            <>
              <Text style={{margin: 10}}>
                {'HCaptcha token: '}
                <Text
                  style={{
                    color: 'darkviolet',
                    fontWeight: 'bold',
                    fontSize: 6,
                  }}>
                  {hCaptchaToken}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => {
                  verifyHCaptchaToken(hCaptchaToken);
                }}>
                <Text style={styles.button}>Verify HCaptcha Token</Text>
              </TouchableOpacity>
              {verifyHCaptchaTokenResponse &&
                verifyHCaptchaTokenResponse.result === 'Verified' && (
                  <Text style={styles.verificationResultSuccess}>
                    HCaptacha Token Verified Successfully
                  </Text>
                )}
              {verifyHCaptchaTokenResponse &&
                verifyHCaptchaTokenResponse.result !== 'Verified' && (
                  <Text style={styles.verificationResultFailure}>
                    HCaptacha Token Verification Failed
                  </Text>
                )}
            </>
          )}
          {hCaptchaStatus && (
            <TouchableOpacity
              onPress={() => {
                setHCaptchaStatus(null);
                setHCaptchaToken(null);
                setVerifyHCaptchaTokenResponse(null);
              }}>
              <Text style={styles.button}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  button: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#6950c3',
    color: '#ffffff',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    height: 30,
    borderColor: '#7a5ce3',
    borderWidth: 2,
  },
  verificationResultSuccess: {
    alignSelf: 'center',
    color: 'green',
  },
  verificationResultFailure: {
    alignSelf: 'center',
    color: 'red',
  },
});

export default App;
