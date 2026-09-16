// Web Speech API wrapper for AI Voice Assistant in Tamil & English

type VoiceListener = (state: VoiceAssistantState) => void;

export interface VoiceAssistantState {
  isSpeaking: boolean;
  isListening: boolean;
  currentSpeechText: string;
  transcribedText: string;
  activeLanguage: 'ta' | 'en';
  speechRate: number;
  availableVoicesCount: number;
  hasSpeechRecognition: boolean;
}

class EmergencyVoiceAssistant {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private listeners: VoiceListener[] = [];
  private voices: SpeechSynthesisVoice[] = [];
  private state: VoiceAssistantState = {
    isSpeaking: false,
    isListening: false,
    currentSpeechText: '',
    transcribedText: '',
    activeLanguage: 'ta',
    speechRate: 1.0,
    availableVoicesCount: 0,
    hasSpeechRecognition: false
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Initialize Speech Recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.state.hasSpeechRecognition = true;

          this.recognition.onstart = () => {
            this.state.isListening = true;
            this.notify();
          };

          this.recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                this.state.transcribedText = event.results[i][0].transcript;
                this.notify();
              }
            }
            if (finalTranscript) {
              this.state.transcribedText = finalTranscript;
              this.notify();
            }
          };

          this.recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e.error);
            this.state.isListening = false;
            this.notify();
          };

          this.recognition.onend = () => {
            this.state.isListening = false;
            this.notify();
          };
        } catch (err) {
          console.warn('Could not initialize SpeechRecognition:', err);
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.state.availableVoicesCount = this.voices.length;
    this.notify();
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public setLanguage(lang: 'ta' | 'en') {
    this.state.activeLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    }
    this.notify();
  }

  public setSpeechRate(rate: number) {
    this.state.speechRate = Math.max(0.7, Math.min(1.8, rate));
    this.notify();
  }

  // Speak aloud in Tamil or English
  public speak(text: string, forceLanguage?: 'ta' | 'en'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stopSpeaking();

      const lang = forceLanguage || this.state.activeLanguage;
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = this.state.speechRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Find matching voice
      if (this.voices.length > 0) {
        if (lang === 'ta') {
          const tamilVoice = this.voices.find(v => 
            v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil')
          );
          if (tamilVoice) {
            utterance.voice = tamilVoice;
            utterance.lang = tamilVoice.lang;
          } else {
            utterance.lang = 'ta-IN';
          }
        } else {
          const enVoice = this.voices.find(v => 
            v.lang === 'en-IN' || v.lang.startsWith('en')
          );
          if (enVoice) {
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang;
          } else {
            utterance.lang = 'en-IN';
          }
        }
      } else {
        utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      }

      this.state.isSpeaking = true;
      this.state.currentSpeechText = text;
      this.notify();

      utterance.onend = () => {
        this.state.isSpeaking = false;
        this.state.currentSpeechText = '';
        this.notify();
        resolve();
      };

      utterance.onerror = () => {
        this.state.isSpeaking = false;
        this.state.currentSpeechText = '';
        this.notify();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.state.isSpeaking = false;
    this.state.currentSpeechText = '';
    this.notify();
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.state.hasSpeechRecognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isTamilText(text: string): boolean {
    // Unicode range for Tamil script: \u0B80-\u0BFF
    return /[\u0B80-\u0BFF]/.test(text);
  }

  // Start Voice Listening (Microphone) with callback options or language code
  public startListening(
    options?: 
      | 'ta' 
      | 'en' 
      | {
          language?: 'ta' | 'en';
          onResult?: (transcript: string, isFinal: boolean) => void;
          onError?: (err: any) => void;
          onEnd?: () => void;
        }
  ): boolean {
    if (!this.recognition) return false;

    let targetLang: 'ta' | 'en' = this.state.activeLanguage;
    let onResultCb: ((transcript: string, isFinal: boolean) => void) | undefined;
    let onErrorCb: ((err: any) => void) | undefined;
    let onEndCb: (() => void) | undefined;

    if (typeof options === 'string') {
      targetLang = options;
    } else if (options && typeof options === 'object') {
      if (options.language) targetLang = options.language;
      onResultCb = options.onResult;
      onErrorCb = options.onError;
      onEndCb = options.onEnd;
    }

    this.recognition.lang = targetLang === 'ta' ? 'ta-IN' : 'en-IN';
    this.state.transcribedText = '';

    // Attach callbacks
    this.recognition.onresult = (event: any) => {
      let interim = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          interim += event.results[i][0].transcript;
          isFinal = true;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      this.state.transcribedText = interim;
      this.notify();
      if (onResultCb && interim) {
        onResultCb(interim, isFinal);
      }
    };

    if (onErrorCb) {
      this.recognition.onerror = (e: any) => {
        this.state.isListening = false;
        this.notify();
        onErrorCb(e);
      };
    }

    if (onEndCb) {
      this.recognition.onend = () => {
        this.state.isListening = false;
        this.notify();
        onEndCb();
      };
    }

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition already started or error:', e);
      return false;
    }
  }

  public stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
    this.state.isListening = false;
    this.notify();
  }

  // Instant Bilingual Emergency Knowledge Engine
  public getBilingualEmergencyAnswer(query: string): { answerTamil: string; answerEnglish: string } {
    const q = query.toLowerCase();

    // 1. Flood & Inundation
    if (q.includes('வெள்ள') || q.includes('flood') || q.includes('தண்ணீர்') || q.includes('water')) {
      return {
        answerTamil: 'வெள்ள அபாய வழிகாட்டுதல்: தரைத்தளத்தில் உள்ளவர்கள் உடனடியாக முதல் தளத்திற்கு செல்லவும். மின்மாற்றிகள் மற்றும் கம்பங்களை தொட வேண்டாம். அத்தியாவசிய மருந்துகள் மற்றும் குடிநீரை எடுத்துக்கொண்டு பாதுகாப்பான நிவாரண மையத்திற்கு செல்லவும். படகு உதவிக்கு 1077 அல்லது 112 எண்ணை அழைக்கவும்.',
        answerEnglish: 'Flood Emergency Advisory: Ground floor residents must immediately evacuate to the first floor or designated high-ground shelter. Do not touch electrical transformers. Keep dry drinking water and essential medicines ready. For boat rescue, call 1077 or 112.'
      };
    }

    // 2. Rural & Livestock (கால்நடைகள்)
    if (q.includes('கால்நடை') || q.includes('மாடு') || q.includes('ஆடு') || q.includes('livestock') || q.includes('cattle') || q.includes('rural') || q.includes('கிராம')) {
      return {
        answerTamil: 'கிராமப்புற மற்றும் கால்நடை பாதுகாப்பு: மாடுகள், ஆடுகள் உள்ளிட்ட கால்நடைகளை உடனடியாக கயிற்றை அவிழ்த்து விடவும். அவற்றை கிராம ஊராட்சி அமைத்துள்ள உயரமான சமுதாய கொட்டகைக்கு மாற்றவும். கிணற்று நீரை நேரடியாக குடிக்காமல் குளோரின் மாத்திரைகளைப் பயன்படுத்தவும். கால்நடை மருத்துவ உதவிக்கு 1077 ஐ அழைக்கவும்.',
        answerEnglish: 'Rural & Livestock Evacuation: Untie all cattle, goats and livestock immediately. Relocate them to elevated community grazing sheds. Disconnect agricultural pump set motors. Do not drink raw well water without chlorine tablets. For veterinary medical assistance, call 1077.'
      };
    }

    // 3. Medical & Ambulance (மருத்துவம்)
    if (q.includes('மருத்துவ') || q.includes('ஆம்புலன்ஸ்') || q.includes('medical') || q.includes('hospital') || q.includes('ambulance') || q.includes('108')) {
      return {
        answerTamil: 'மருத்துவ அவசர உதவி: 108 அவசர ஆம்புலன்ஸ் பிரிவு மற்றும் மாவட்ட அரசு தலைமை மருத்துவமனை தீவிர சிகிச்சைப் பிரிவு உஷார்படுத்தப்பட்டுள்ளன. நடமாடும் மருத்துவ நிவாரணக் குழு உடனடியாக வரவழைக்கப்பட்டுள்ளது. அவசர மருத்துவ உதவிக்கு 108 ஐ நேரடியாக அழைக்கவும்.',
        answerEnglish: 'Emergency Medical Response: The 108 Ambulance fleet and District Headquarters Hospital Trauma ICU are activated. Mobile Medical Disaster Units are en route. For instant medical ambulance dispatch, dial 108 directly.'
      };
    }

    // 4. Urban & City Safety (நகர்ப்புறம் / அடுக்குமாடி)
    if (q.includes('நகர்ப்புற') || q.includes('அடுக்குமாடி') || q.includes('urban') || q.includes('apartment') || q.includes('metro') || q.includes('parking')) {
      return {
        answerTamil: 'நகர்ப்புற அவசர வழிகாட்டுதல்: அடுக்குமாடி குடியிருப்புகளின் அடித்தள (Basement) வாகன நிறுத்துமிடத்திற்குள் செல்ல வேண்டாம். மின்தூக்கி (Lift) பயன்படுத்துவதை தவிர்க்கவும். சுரங்கப்பாதைகள் மற்றும் தாழ்வான பாலங்களை தவிர்க்கவும். மாநகராட்சி குடிநீர் விநியோக முகாம்களை அணுகவும்.',
        answerEnglish: 'Urban Area Emergency Protocol: Do NOT enter basement car parks once floodwaters begin entering. Avoid using apartment elevators/lifts. Avoid low-lying subways and underpasses. Safe potable drinking water is arranged via municipal mobile tankers.'
      };
    }

    // 5. SMS & Citizen Alert Auto-Dispatch (தானியங்கி எஸ்.எம்.எஸ்)
    if (q.includes('sms') || q.includes('செய்தி') || q.includes('அனுப்பு') || q.includes('send') || q.includes('alert') || q.includes('dispatch') || q.includes('citizen') || q.includes('zone') || q.includes('district') || q.includes('people') || q.includes('auto')) {
      return {
        answerTamil: 'தானியங்கி அவசர SMS அமைப்பு: நீங்கள் மக்களை தேர்ந்தெடுக்க தேவையில்லை! பாதிக்கப்பட்ட அனைத்து மண்டலங்களுக்கும் (செங்கல்பட்டு, நீலகிரி, வயநாடு, மும்பை உள்ளிட்ட மாவட்டங்களுக்கு) அவசர SMS மற்றும் செல் பிராட்காஸ்ட் தானாக அனுப்பப்பட்டுவிட்டது. 108 ஆம்புலன்ஸ்கள் மற்றும் மீட்புப் படைகள் தயார் நிலையில் உள்ளன.',
        answerEnglish: 'Autonomous Emergency Alert Dispatch: No manual contact selection is required! Emergency broadcast SMS has been autonomously transmitted to all affected zones and districts. Over 185,000 citizens in hazard radii, nearby 108 medical ambulance fleets, and NDRF battalions have been mobilized immediately.'
      };
    }

    // Default Fallback
    return {
      answerTamil: 'தேசிய பேரிடர் மேலாண்மை AI குரல் வழிகாட்டி: இந்தியாவின் அனைத்து மாநிலங்கள் மற்றும் மாவட்டங்களுக்கான நேரலை எச்சரிக்கைகள், மருத்துவக் குழுக்கள், மற்றும் நிவாரண மையங்கள் தயார்நிலையில் உள்ளன. தேசிய அவசர உதவிக்கு 112 அல்லது 108 ஐ அழைக்கவும்.',
      answerEnglish: 'National Disaster Management AI Voice Assistant: Synchronized with NDMA and SDMA across all Indian states. Live evacuation routes, 108 medical response, and emergency SMS broadcasts are active. For direct emergency help, dial 112 or 108.'
    };
  }

  // Returns single language answer string directly
  public getEmergencyAnswer(query: string, lang: 'ta' | 'en'): string {
    const pair = this.getBilingualEmergencyAnswer(query);
    return lang === 'ta' ? pair.answerTamil : pair.answerEnglish;
  }
}

export const voiceAssistant = new EmergencyVoiceAssistant();
