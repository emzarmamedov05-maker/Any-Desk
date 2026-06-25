export interface VocabItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "write-in";
  question: string;
  options?: string[];
  answer: string;
}

export interface LessonStage {
  id: number;
  title: string;
  shortDesc: string;
  vocab: VocabItem[];
  grammarTitle: string;
  grammarExplanation: string;
  grammarExamples: { original: string; translated: string; phonetic?: string }[];
  vocabQuiz: QuizQuestion[];
  grammarQuiz: QuizQuestion[];
  pronunciationTarget: {
    phrase: string;
    translation: string;
    phonetic: string;
    tip: string;
  };
}

export interface LanguageCurriculum {
  [languageCode: string]: LessonStage[];
}

export const CURRICULUMS: LanguageCurriculum = {
  // Curriculum for learning English (İngilizce Öğrenimi - Sıfırdan Profesyonele)
  en: [
    {
      id: 1,
      title: "Etap 1: Temel Selamlaşma ve Tanışma (Beginner - A1)",
      shortDesc: "Yolculuğa sıfırdan başlayın! Kendinizi tanıtma ve en sık kullanılan selamlaşma kalıpları.",
      vocab: [
        { id: "en-1-1", word: "Hello", translation: "Merhaba", pronunciation: "Hel-lov" },
        { id: "en-1-2", word: "Thank you", translation: "Teşekkür ederim", pronunciation: "Tenk yu" },
        { id: "en-1-3", word: "Yes", translation: "Evet", pronunciation: "Yes" },
        { id: "en-1-4", word: "No", translation: "Hayır", pronunciation: "Nov" },
        { id: "en-1-5", word: "Please", translation: "Lütfen", pronunciation: "Pliiz" },
        { id: "en-1-6", word: "My name is...", translation: "Benim adım...", pronunciation: "May neym iz..." },
        { id: "en-1-7", word: "Good morning", translation: "Günaydın", pronunciation: "Gud mor-ning" },
        { id: "en-1-8", word: "Goodbye", translation: "Hoşça kal / Görüşürüz", pronunciation: "Gud-bay" }
      ],
      grammarTitle: "İngilizcede Temel Özne ve 'To Be' Yardımcı Fiilleri",
      grammarExplanation: "İngilizcede en temel cümleler 'Özne + Yardımcı Fiil (am/is/are) + İsim/Sıfat' yapısıyla kurulur. Öznelerimiz: I (Ben) [am], You (Sen/Siz) [are], He/She/It (O) [is], We (Biz) [are], They (Onlar) [are].",
      grammarExamples: [
         { original: "I am a student.", translated: "Ben bir öğrenciyim." },
         { original: "She is happy.", translated: "O mutlu." },
         { original: "We are ready.", translated: "Biz hazırız." }
      ],
      vocabQuiz: [
        {
          id: "en-q1-v1",
          type: "multiple-choice",
          question: "'Thank you' kelimesinin Türkçe karşılığı nedir?",
          options: ["Lütfen", "Teşekkür ederim", "Merhaba", "Görüşürüz"],
          answer: "Teşekkür ederim"
        },
        {
          id: "en-q1-v2",
          type: "write-in",
          question: "İngilizcede 'Lütfen' anlamına gelen kelimeyi yazın (İlk harfi büyük):",
          answer: "Please"
        },
        {
          id: "en-q1-v3",
          type: "multiple-choice",
          question: "'Günaydın' kelimesinin İngilizce karşılığı hangisidir?",
          options: ["Good morning", "Goodbye", "Hello", "My name is"],
          answer: "Good morning"
        },
        {
          id: "en-q1-v4",
          type: "multiple-choice",
          question: "'Görüşürüz/Hoşça kal' kelimesinin İngilizce karşılığı hangisidir?",
          options: ["Yes", "Goodbye", "Please", "Hello"],
          answer: "Goodbye"
        },
        {
          id: "en-q1-v5",
          type: "write-in",
          question: "İngilizcede 'Evet' anlamına gelen kelimeyi yazın:",
          answer: "Yes"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q1-g1",
          type: "multiple-choice",
          question: "'I' öznesinden sonra hangi yardımcı fiil gelir?",
          options: ["is", "are", "am", "be"],
          answer: "am"
        },
        {
          id: "en-q1-g2",
          type: "write-in",
          question: "'O mutlu' cümlesindeki boşluğu doldurun: 'She ___ happy.'",
          answer: "is"
        },
        {
          id: "en-q1-g3",
          type: "multiple-choice",
          question: "'We' (Biz) öznesi ile hangi yardımcı fiil kullanılır?",
          options: ["am", "is", "are", "was"],
          answer: "are"
        },
        {
          id: "en-q1-g4",
          type: "write-in",
          question: "'Benim adım John' cümlesindeki boşluğu doldurun: 'My name ___ John.'",
          answer: "is"
        },
        {
          id: "en-q1-g5",
          type: "multiple-choice",
          question: "'They are students' cümlesinin Türkçe anlamı nedir?",
          options: ["Biz öğrenciyiz.", "Onlar öğrencidir.", "Sen öğrencisin.", "O bir öğrencidir."],
          answer: "Onlar öğrencidir."
        }
      ],
      pronunciationTarget: {
        phrase: "Nice to meet you",
        translation: "Tanıştığıma memnun oldum",
        phonetic: "Nays tu miit yu",
        tip: "Cümleyi söylerken 'meet' kelimesindeki 'ee' sesini biraz uzatın."
      }
    },
    {
      id: 2,
      title: "Etap 2: Günlük Yaşam, Sorular ve İhtiyaçlar (Elementary - A2)",
      shortDesc: "Yiyecekler, konumlar ve günlük hayatta soru sorarak iletişim kurma teknikleri.",
      vocab: [
        { id: "en-2-1", word: "Water", translation: "Su", pronunciation: "Va-tır" },
        { id: "en-2-2", word: "Bread", translation: "Ekmek", pronunciation: "Bred" },
        { id: "en-2-3", word: "Friend", translation: "Arkadaş", pronunciation: "Frend" },
        { id: "en-2-4", word: "Where", translation: "Nerede / Neresi", pronunciation: "Ve-ır" },
        { id: "en-2-5", word: "How much", translation: "Ne kadar (Fiyat)", pronunciation: "Hav maç" },
        { id: "en-2-6", word: "Time", translation: "Zaman / Saat", pronunciation: "Taym" },
        { id: "en-2-7", word: "Breakfast", translation: "Kahvaltı", pronunciation: "Brek-fıst" },
        { id: "en-2-8", word: "Store", translation: "Dükkan / Mağaza", pronunciation: "Stor" }
      ],
      grammarTitle: "İngilizcede Soru Kelimeleri (Wh- Questions) ve Geniş Zaman",
      grammarExplanation: "İngilizcede soru sormak için cümlenin başına 'Where' (Nerede), 'What' (Ne), 'Who' (Kim), 'How' (Nasıl) gibi kelimeler getirilir. Fiil içeren sorularda ise 'do' veya 'does' yardımcı fiili kullanılır.",
      grammarExamples: [
        { original: "Where do you live?", translated: "Nerede yaşıyorsun?" },
        { original: "What is this?", translated: "Bu nedir?" },
        { original: "I drink water every day.", translated: "Her gün su içerim." }
      ],
      vocabQuiz: [
        {
          id: "en-q2-v1",
          type: "multiple-choice",
          question: "'Bread' kelimesinin Türkçe karşılığı nedir?",
          options: ["Su", "Ekmek", "Süt", "Kahvaltı"],
          answer: "Ekmek"
        },
        {
          id: "en-q2-v2",
          type: "write-in",
          question: "Fiyat sorarken kullanılan 'Ne kadar' kalıbını yazın (İki kelime):",
          answer: "How much"
        },
        {
          id: "en-q2-v3",
          type: "multiple-choice",
          question: "'Breakfast' kelimesinin Türkçe karşılığı nedir?",
          options: ["Akşam yemeği", "Öğle yemeği", "Kahvaltı", "Ekmek"],
          answer: "Kahvaltı"
        },
        {
          id: "en-q2-v4",
          type: "multiple-choice",
          question: "'Friend' kelimesinin Türkçe karşılığı nedir?",
          options: ["Öğretmen", "Aile", "Arkadaş", "Düşman"],
          answer: "Arkadaş"
        },
        {
          id: "en-q2-v5",
          type: "write-in",
          question: "İngilizcede 'Nerede' anlamına gelen soru kelimesini yazın:",
          answer: "Where"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q2-g1",
          type: "multiple-choice",
          question: "'Nerede yaşıyorsun?' sorusunun doğru İngilizce karşılığı hangisidir?",
          options: ["What do you live?", "Where do you live?", "Who do you live?", "How do you live?"],
          answer: "Where do you live?"
        },
        {
          id: "en-q2-g2",
          type: "write-in",
          question: "Soru sormak için boşluğu doldurun: '___ is my key?' (Anahtarım nerede?)",
          answer: "Where"
        },
        {
          id: "en-q2-g3",
          type: "multiple-choice",
          question: "Geniş zamanda 'He/She/It' öznelerinde fiillere hangi takı eklenir?",
          options: ["-ing", "-ed", "-s / -es", "-ly"],
          answer: "-s / -es"
        },
        {
          id: "en-q2-g4",
          type: "write-in",
          question: "'Sen süt seversin' cümlesindeki eksikliği tamamlayın: 'You ___ milk.' (Sevmek fiili)",
          answer: "like"
        },
        {
          id: "en-q2-g5",
          type: "multiple-choice",
          question: "'Do they speak English?' sorusunun Türkçe karşılığı nedir?",
          options: ["İngilizce konuşuyor musun?", "Onlar İngilizce konuşur mu?", "O İngilizce konuşabilir mi?", "İngilizce konuşacaklar mı?"],
          answer: "Onlar İngilizce konuşur mu?"
        }
      ],
      pronunciationTarget: {
        phrase: "Where is the library?",
        translation: "Kütüphane nerede?",
        phonetic: "Ve-ır iz dı layb-re-ri",
        tip: "'Where' derken dudaklarınızı yuvarlaklaştırıp üfleyerek başlayın, 'library' kelimesindeki 'r' seslerini yumuşak geçin."
      }
    },
    {
      id: 3,
      title: "Etap 3: Alışveriş, Seyahat ve İstekler (Intermediate - B1)",
      shortDesc: "Yön tarifleri, bilet satın alma, istekleri nazikçe belirtme ve modal kullanımı.",
      vocab: [
        { id: "en-3-1", word: "Ticket", translation: "Bilet", pronunciation: "Ti-kıt" },
        { id: "en-3-2", word: "Hotel", translation: "Otel", pronunciation: "Hov-tel" },
        { id: "en-3-3", word: "Left", translation: "Sol", pronunciation: "Left" },
        { id: "en-3-4", word: "Right", translation: "Sağ", pronunciation: "Rayt" },
        { id: "en-3-5", word: "Straight", translation: "Düz / Doğruca", pronunciation: "Streyt" },
        { id: "en-3-6", word: "Price", translation: "Fiyat", pronunciation: "Prays" },
        { id: "en-3-7", word: "Airport", translation: "Havalimanı", pronunciation: "Eyr-port" },
        { id: "en-3-8", word: "Passport", translation: "Pasaport", pronunciation: "Pas-port" }
      ],
      grammarTitle: "Yardımcı Modallar: 'Can' (Yetenek/Rica) ve 'Want to' (İstek)",
      grammarExplanation: "Rica, izin veya yetenek durumlarında 'Can', isteklerimizi doğrudan belirtirken 'Want to' (istemek) kalıbı kullanılır. Bu yapılardan sonra gelen fiiller hiçbir ek almadan yalın haliyle kullanılır.",
      grammarExamples: [
        { original: "I can help you.", translated: "Sana yardım edebilirim." },
        { original: "I want to buy a ticket.", translated: "Bir bilet satın almak istiyorum." },
        { original: "Can you turn left?", translated: "Sola dönebilir misiniz?" }
      ],
      vocabQuiz: [
        {
          id: "en-q3-v1",
          type: "multiple-choice",
          question: "'Left' kelimesinin yön olarak karşılığı nedir?",
          options: ["Sağ", "Sol", "Düz", "Aşağı"],
          answer: "Sol"
        },
        {
          id: "en-q3-v2",
          type: "write-in",
          question: "Uçuş öncesi havalimanında gösterilen 'Pasaport' kelimesinin İngilizcesini yazın:",
          answer: "Passport"
        },
        {
          id: "en-q3-v3",
          type: "multiple-choice",
          question: "'Airport' kelimesinin Türkçe karşılığı nedir?",
          options: ["Otogar", "Liman", "Tren İstasyonu", "Havalimanı"],
          answer: "Havalimanı"
        },
        {
          id: "en-q3-v4",
          type: "multiple-choice",
          question: "'Price' kelimesinin anlamı nedir?",
          options: ["Fiyat", "Bilet", "Hediye", "Ödül"],
          answer: "Fiyat"
        },
        {
          id: "en-q3-v5",
          type: "write-in",
          question: "İngilizcede otel anlamına gelen kelimeyi yazın:",
          answer: "Hotel"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q3-g1",
          type: "multiple-choice",
          question: "'Bir bilet almak istiyorum' cümlesinin en doğru İngilizcesi hangisidir?",
          options: ["I can buy a ticket.", "I want to buy a ticket.", "I want buy a ticket.", "Can I buy a ticket?"],
          answer: "I want to buy a ticket."
        },
        {
          id: "en-q3-g2",
          type: "write-in",
          question: "Yetenek belirtmek için boşluğu doldurun: 'I ___ speak English.' (İngilizce konuşabilirim.)",
          answer: "can"
        },
        {
          id: "en-q3-g3",
          type: "multiple-choice",
          question: "'Can you help me?' sorusunun anlamı nedir?",
          options: ["Bana yardım etmek istiyor musun?", "Bana yardım edebilir misin?", "Sana yardım edebilir miyim?", "Yardım edecek misin?"],
          answer: "Bana yardım edebilir misin?"
        },
        {
          id: "en-q3-g4",
          type: "write-in",
          question: "'Biz gitmek istiyoruz' cümlesindeki boşluğu tamamlayın: 'We want ___ go.'",
          answer: "to"
        },
        {
          id: "en-q3-g5",
          type: "multiple-choice",
          question: "İngilizcede 'Sola dön' ifadesi nasıl söylenir?",
          options: ["Turn right", "Turn left", "Go straight", "Turn straight"],
          answer: "Turn left"
        }
      ],
      pronunciationTarget: {
        phrase: "How much is this ticket?",
        translation: "Bu bilet ne kadar?",
        phonetic: "Hav maç iz dis ti-kıt",
        tip: "'this' kelimesindeki 'th' sesini söylerken dilinizi hafifçe üst dişlerinizin arasına sıkıştırıp üfleyin."
      }
    },
    {
      id: 4,
      title: "Etap 4: Duygular, Sosyal Yaşam ve Geçmiş (Upper-Intermediate - B2)",
      shortDesc: "Duyguları ifade etme ve geçmiş zamanda yaşanmış olayları akıcı bir şekilde anlatma.",
      vocab: [
        { id: "en-4-1", word: "Happy", translation: "Mutlu", pronunciation: "He-pi" },
        { id: "en-4-2", word: "Sad", translation: "Üzgün", pronunciation: "Sed" },
        { id: "en-4-3", word: "Angry", translation: "Kızgın / Öfkeli", pronunciation: "En-gri" },
        { id: "en-4-4", word: "Yesterday", translation: "Dün", pronunciation: "Yes-tır-dey" },
        { id: "en-4-5", word: "Family", translation: "Aile", pronunciation: "Fe-mi-li" },
        { id: "en-4-6", word: "Memory", translation: "Anı / Hafıza", pronunciation: "Me-mo-ri" },
        { id: "en-4-7", word: "Excited", translation: "Heyecanlı", pronunciation: "Ek-say-tıd" },
        { id: "en-4-8", word: "Together", translation: "Birlikte", pronunciation: "Tu-ged-ır" }
      ],
      grammarTitle: "İngilizcede Geçmiş Zaman (Simple Past Tense)",
      grammarExplanation: "Geçmişte tamamlanmış olayları anlatmak için fiillerin geçmiş zaman halleri kullanılır. Düzenli fiillerin sonuna '-ed' takısı getirilir (worked, watched). Düzensiz fiiller ise tamamen değişir (go -> went, see -> saw, have -> had).",
      grammarExamples: [
        { original: "I was happy yesterday.", translated: "Dün mutluydum." },
        { original: "We played tennis together.", translated: "Birlikte tenis oynadık." },
        { original: "She went to London last year.", translated: "Geçen yıl Londra'ya gitti." }
      ],
      vocabQuiz: [
        {
          id: "en-q4-v1",
          type: "multiple-choice",
          question: "'Excited' kelimesinin anlamı nedir?",
          options: ["Üzgün", "Heyecanlı", "Kızgın", "Sakin"],
          answer: "Heyecanlı"
        },
        {
          id: "en-q4-v2",
          type: "write-in",
          question: "İngilizcede 'Birlikte' anlamına gelen kelimeyi yazın:",
          answer: "Together"
        },
        {
          id: "en-q4-v3",
          type: "multiple-choice",
          question: "'Yesterday' kelimesinin Türkçe karşılığı hangisidir?",
          options: ["Bugün", "Yarın", "Dün", "Geçen hafta"],
          answer: "Dün"
        },
        {
          id: "en-q4-v4",
          type: "multiple-choice",
          question: "'Sad' kelimesinin anlamı nedir?",
          options: ["Mutlu", "Kızgın", "Üzgün", "Yorgun"],
          answer: "Üzgün"
        },
        {
          id: "en-q4-v5",
          type: "write-in",
          question: "İngilizcede 'Anı/Hafıza' anlamına gelen kelimeyi yazın:",
          answer: "Memory"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q4-g1",
          type: "multiple-choice",
          question: "Düzenli fiiller geçmiş zamanda (Simple Past Tense) hangi eki alır?",
          options: ["-ing", "-s", "-ed", "-es"],
          answer: "-ed"
        },
        {
          id: "en-q4-g2",
          type: "write-in",
          question: "'Geçen gün bir film izledim' cümlesindeki boşluğu doldurun: 'I ___ a movie yesterday.' (watch fiilinin geçmiş hali)",
          answer: "watched"
        },
        {
          id: "en-q4-g3",
          type: "multiple-choice",
          question: "'Go' (Gitmek) düzensiz fiilinin geçmiş zaman (V2) hali hangisidir?",
          options: ["goed", "went", "gone", "goes"],
          answer: "went"
        },
        {
          id: "en-q4-g4",
          type: "write-in",
          question: "'Dün çok meşguldüm' cümlesindeki boşluğu doldurun: 'I ___ very busy yesterday.'",
          answer: "was"
        },
        {
          id: "en-q4-g5",
          type: "multiple-choice",
          question: "'They visited their family' cümlesinin Türkçe karşılığı nedir?",
          options: ["Onlar ailelerini ziyaret ederler.", "Onlar ailelerini ziyaret ettiler.", "Biz ailemizi ziyaret ettik.", "O ailesini ziyaret etti."],
          answer: "Onlar ailelerini ziyaret ettiler."
        }
      ],
      pronunciationTarget: {
        phrase: "I had an amazing day yesterday",
        translation: "Dün harika bir gün geçirdim",
        phonetic: "May had en ı-mey-zing dey yes-tır-dey",
        tip: "'Amazing' kelimesindeki 'z' sesini vurgulayarak net bir şekilde çıkarın."
      }
    },
    {
      id: 5,
      title: "Etap 5: Profesyonel İş Hayatı ve Kariyer (Advanced - C1)",
      shortDesc: "İş görüşmeleri, profesyonel e-postalar, toplantı terimleri ve karmaşık dil yapıları.",
      vocab: [
        { id: "en-5-1", word: "Schedule", translation: "Program / Takvim", pronunciation: "Şe-dyul" },
        { id: "en-5-2", word: "Agreement", translation: "Anlaşma / Sözleşme", pronunciation: "E-grii-mınt" },
        { id: "en-5-3", word: "Collaborate", translation: "İş birliği yapmak", pronunciation: "Kı-la-bı-reyt" },
        { id: "en-5-4", word: "Deadline", translation: "Son teslim tarihi", pronunciation: "Ded-layn" },
        { id: "en-5-5", word: "Performance", translation: "Performans / Başarım", pronunciation: "Per-for-mıns" },
        { id: "en-5-6", word: "Negotiate", translation: "Müzakere etmek", pronunciation: "Nı-gov-şi-eyt" },
        { id: "en-5-7", word: "Proposal", translation: "Öneri / Teklif", pronunciation: "Prı-pov-zıl" },
        { id: "en-5-8", word: "Manager", translation: "Yönetici / Müdür", pronunciation: "Me-nı-cır" }
      ],
      grammarTitle: "Koşul Cümlecikleri (Conditionals - Type 1 & 2)",
      grammarExplanation: "Koşul belirten cümlelerde 'If' (Eğer) kullanılır. Gerçekçi gelecek durumlarında Type 1 (If + Present, Will + Verb), hayali veya mevcut duruma aykırı durumlarda Type 2 (If + Past, Would + Verb) tercih edilir.",
      grammarExamples: [
        { original: "If we sign the agreement, we will start next week.", translated: "Anlaşmayı imzalarsak haftaya başlayacağız." },
        { original: "If I were the manager, I would change the schedule.", translated: "Müdür olsaydım takvimi değiştirirdim." },
        { original: "We can collaborate if you are interested.", translated: "Eğer ilgilenirseniz iş birliği yapabiliriz." }
      ],
      vocabQuiz: [
        {
          id: "en-q5-v1",
          type: "multiple-choice",
          question: "'Deadline' kelimesinin Türkçe karşılığı nedir?",
          options: ["İş başlangıcı", "Son teslim tarihi", "Müzakere süresi", "Performans değerlendirmesi"],
          answer: "Son teslim tarihi"
        },
        {
          id: "en-q5-v2",
          type: "write-in",
          question: "İngilizcede 'İş birliği yapmak' anlamına gelen fiili yazın:",
          answer: "Collaborate"
        },
        {
          id: "en-q5-v3",
          type: "multiple-choice",
          question: "'Agreement' kelimesinin anlamı nedir?",
          options: ["Tartışma", "Görüşme", "Anlaşma / Sözleşme", "Teklif"],
          answer: "Anlaşma / Sözleşme"
        },
        {
          id: "en-q5-v4",
          type: "multiple-choice",
          question: "'Schedule' kelimesinin anlamı nedir?",
          options: ["Program / Takvim", "Yönetici", "Öneri", "Sözleşme"],
          answer: "Program / Takvim"
        },
        {
          id: "en-q5-v5",
          type: "write-in",
          question: "İş hayatındaki 'Öneri / Teklif' anlamına gelen kelimeyi yazın:",
          answer: "Proposal"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q5-g1",
          type: "multiple-choice",
          question: "Type 2 koşul cümlesinde 'I/He/She/It' özneleriyle genellikle hangi geçmiş yardımcı fiil kullanılır (Daha resmi/doğru kullanım)?",
          options: ["was", "were", "is", "been"],
          answer: "were"
        },
        {
          id: "en-q5-g2",
          type: "write-in",
          question: "'If you study hard, you ___ pass the exam.' (Gelecek zaman olasılık eki)",
          answer: "will"
        },
        {
          id: "en-q5-g3",
          type: "multiple-choice",
          question: "'If we had more time, we would negotiate' cümlesinin anlamı nedir?",
          options: ["Daha çok zamanımız var, müzakere edeceğiz.", "Daha çok zamanımız olsaydı, müzakere ederdik.", "Müzakere etmek için zamanımız kalmadı.", "Zaman bulursak müzakere edebiliriz."],
          answer: "Daha çok zamanımız olsaydı, müzakere ederdik."
        },
        {
          id: "en-q5-g4",
          type: "write-in",
          question: "Cümledeki boşluğu 'If' ile doldurun: '___ we collaborate, we can finish early.'",
          answer: "If"
        },
        {
          id: "en-q5-g5",
          type: "multiple-choice",
          question: "'I would buy it if I had money' cümlesinde hangi koşul tipi (Conditional Type) kullanılmıştır?",
          options: ["Type 0", "Type 1", "Type 2", "Type 3"],
          answer: "Type 2"
        }
      ],
      pronunciationTarget: {
        phrase: "We must meet the project deadline",
        translation: "Projenin son teslim tarihine yetişmeliyiz",
        phonetic: "Vii mast miit dı pro-cekt ded-layn",
        tip: "'deadline' derken 'd' ve 'l' harflerini birleştirerek akıcı bir tonla seslendirin."
      }
    },
    {
      id: 6,
      title: "Etap 6: Üst Düzey Yönetim, Diplomasi & Retorik (Professional - C2)",
      shortDesc: "Uluslararası toplantılarda konuşma, akademik analiz yeteneği ve üst seviye diplomatik retorik.",
      vocab: [
        { id: "en-6-1", word: "Implement", translation: "Uygulamaya koymak / Yürütmek", pronunciation: "Im-pli-ment" },
        { id: "en-6-2", word: "Sustainable", translation: "Sürdürülebilir", pronunciation: "Sıs-tey-nı-bıl" },
        { id: "en-6-3", word: "Feasible", translation: "Uygulanabilir / Yapılabilir", pronunciation: "Fii-zı-bıl" },
        { id: "en-6-4", word: "Strategic", translation: "Stratejik", pronunciation: "Strı-tii-cik" },
        { id: "en-6-5", word: "Framework", translation: "Çerçeve / Yapı", pronunciation: "Freym-vörk" },
        { id: "en-6-6", word: "Consensus", translation: "Fikir birliği / Uzlaşı", pronunciation: "Kın-sen-sıs" },
        { id: "en-6-7", word: "Leverage", translation: "Etkin kullanmak / Kaldıraç", pronunciation: "Lev-ric" },
        { id: "en-6-8", word: "Advocate", translation: "Savunmak / Desteklemek", pronunciation: "Ed-vı-keyt" }
      ],
      grammarTitle: "Edilgen Çatı (Passive Voice) ve Akademik Yapılar",
      grammarExplanation: "Profesyonel ve akademik dilde eylemi yapan kişiden ziyade eylemin kendisi önemlidir. Bu durumlarda Edilgen Çatı (Passive Voice: 'To Be + Fiilin 3. Hali') yapısı tercih edilir.",
      grammarExamples: [
        { original: "The strategic plan was implemented successfully.", translated: "Stratejik plan başarıyla uygulamaya konuldu." },
        { original: "A sustainable framework must be created.", translated: "Sürdürülebilir bir çerçeve oluşturulmalıdır." },
        { original: "Consensus has been reached by the board.", translated: "Yönetim kurulu tarafından uzlaşmaya varıldı." }
      ],
      vocabQuiz: [
        {
          id: "en-q6-v1",
          type: "multiple-choice",
          question: "'Sustainable' kelimesinin Türkçe karşılığı nedir?",
          options: ["Geçici", "Sürdürülebilir", "Stratejik", "Uygulanamaz"],
          answer: "Sürdürülebilir"
        },
        {
          id: "en-q6-v2",
          type: "write-in",
          question: "Diplomaside çok önemli olan 'Fikir birliği / Uzlaşı' anlamına gelen C2 kelimesini yazın:",
          answer: "Consensus"
        },
        {
          id: "en-q6-v3",
          type: "multiple-choice",
          question: "'Implement' kelimesinin anlamı nedir?",
          options: ["Uygulamaya koymak", "Reddetmek", "Ertelemek", "Planlamak"],
          answer: "Uygulamaya koymak"
        },
        {
          id: "en-q6-v4",
          type: "multiple-choice",
          question: "'Feasible' kelimesinin anlamı nedir?",
          options: ["Zorlayıcı", "Gereksiz", "Uygulanabilir / Yapılabilir", "Hatalı"],
          answer: "Uygulanabilir / Yapılabilir"
        },
        {
          id: "en-q6-v5",
          type: "write-in",
          question: "İngilizcede 'Savunmak / Desteklemek' anlamına gelen fiili yazın:",
          answer: "Advocate"
        }
      ],
      grammarQuiz: [
        {
          id: "en-q6-g1",
          type: "multiple-choice",
          question: "Passive Voice (Edilgen Çatı) cümlelerinde fiilin kaçıncı hali (Past Participle) kullanılır?",
          options: ["1. Hali (Yalın)", "2. Hali (Past)", "3. Hali (V3 / Participle)", "Fiilin sonuna -ing eklenmiş hali"],
          answer: "3. Hali (V3 / Participle)"
        },
        {
          id: "en-q6-g2",
          type: "write-in",
          question: "'The decision was made.' cümlesindeki boşluğu doldurarak edilgen yapın: 'The program ___ developed last year.'",
          answer: "was"
        },
        {
          id: "en-q6-g3",
          type: "multiple-choice",
          question: "'A sustainable solution must be found' cümlesinin Türkçe karşılığı hangisidir?",
          options: ["Sürdürülebilir bir çözüm bulmalıyız.", "Sürdürülebilir bir çözüm bulunmalıdır.", "Sürdürülebilir çözümler arıyoruz.", "Çözümümüz sürdürülebilir olmak zorundadır."],
          answer: "Sürdürülebilir bir çözüm bulunmalıdır."
        },
        {
          id: "en-q6-g4",
          type: "write-in",
          question: "'Tarafımızdan' anlamında edilgen cümlelerde kullanılan edatı yazın (örn: 'done ___ us'):",
          answer: "by"
        },
        {
          id: "en-q6-g5",
          type: "multiple-choice",
          question: "'We should leverage our resources' cümlesinin anlamı nedir?",
          options: ["Kaynaklarımızı boşa harcamalıyız.", "Kaynaklarımızı etkin kullanmalıyız.", "Kaynak arayışına girmeliyiz.", "Kaynaklarımızı sınırlandırmalıyız."],
          answer: "Kaynaklarımızı etkin kullanmalıyız."
        }
      ],
      pronunciationTarget: {
        phrase: "We have reached a strategic consensus",
        translation: "Stratejik bir uzlaşmaya vardık",
        phonetic: "Vii hev riiçt ey strı-tii-cik kın-sen-sıs",
        tip: "'reached' derken sonundaki 't' sesini çok hafif ve net duyulacak şekilde patlatarak söyleyin."
      }
    }
  ],

  // Curriculum for learning Georgian (Gürcüce Öğrenimi - Sıfırdan Profesyonele)
  ka: [
    {
      id: 1,
      title: "Etap 1: Temel Tanışma ve Selamlaşma (Beginner - A1)",
      shortDesc: "Gürcüce alfabesine (Mhedruli) büyüleyici bir giriş yapın ve temel selamlaşmaları öğrenin.",
      vocab: [
        { id: "ka-1-1", word: "გამარჯობა", translation: "Merhaba", pronunciation: "Gamarjoba" },
        { id: "ka-1-2", word: "მადლობა", translation: "Teşekkürler", pronunciation: "Madloba" },
        { id: "ka-1-3", word: "კი", translation: "Evet", pronunciation: "Ki" },
        { id: "ka-1-4", word: "არა", translation: "Hayır", pronunciation: "Ara" },
        { id: "ka-1-5", word: "გთხოვთ", translation: "Lütfen", pronunciation: "Gtokhovt" },
        { id: "ka-1-6", word: "ნახვამდის", translation: "Hoşça kal / Görüşürüz", pronunciation: "Nakhvamdis" },
        { id: "ka-1-7", word: "დილა მშვიდობისა", translation: "Günaydın", pronunciation: "Dila mshvidobisa" },
        { id: "ka-1-8", word: "კარგი", translation: "Tamam / İyi", pronunciation: "Kargi" }
      ],
      grammarTitle: "Gürcü Alfabesi (Mhedruli) ve Yardımcı Fiil 'var' (Olmak)",
      grammarExplanation: "Gürcüce kendine has 33 harfli, büyük-küçük harf ayrımı olmayan çok estetik bir alfabe kullanır. Gürcücede 'Ben ...-yım/yim' eki ismin sonuna getirilen eklerle veya 'var' (v-ar) yardımcı fiiliyle sağlanır.",
      grammarExamples: [
        { original: "მე ვარ თურქი.", translated: "Ben Türk'üm.", phonetic: "Me var turki." },
        { original: "როგორ ხარ?", translated: "Nasılsın?", phonetic: "Rogor khar?" },
        { original: "კარგად ვარ.", translated: "İyiyim.", phonetic: "Kargad var." }
      ],
      vocabQuiz: [
        {
          id: "ka-q1-v1",
          type: "multiple-choice",
          question: "'გამარჯობა' (Gamarjoba) kelimesinin anlamı nedir?",
          options: ["Teşekkürler", "Merhaba", "Lütfen", "Hoşça kal"],
          answer: "Merhaba"
        },
        {
          id: "ka-q1-v2",
          type: "write-in",
          question: "Okunuşu 'Madloba' olan 'Teşekkürler' kelimesini Gürcü alfabesiyle yazın:",
          answer: "მადლობა"
        },
        {
          id: "ka-q1-v3",
          type: "multiple-choice",
          question: "'არა' (Ara) kelimesinin Türkçe anlamı nedir?",
          options: ["Evet", "Hayır", "Nerede", "Tamam"],
          answer: "Hayır"
        },
        {
          id: "ka-q1-v4",
          type: "multiple-choice",
          question: "'დილა მშვიდობისა' (Dila mshvidobisa) ne demektir?",
          options: ["İyi geceler", "Günaydın", "Merhaba", "Hoşça kal"],
          answer: "Günaydın"
        },
        {
          id: "ka-q1-v5",
          type: "write-in",
          question: "Gürcüce 'Görüşürüz' veya 'Hoşça kal' anlamına gelen 'ნახვამდის' kelimesinin okunuşunu yazın:",
          answer: "nakhvamdis"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q1-g1",
          type: "multiple-choice",
          question: "Gürcücede 'Ben iyiyim' nasıl söylenir?",
          options: ["Rogor khar", "Kargad var", "Gamarjoba var", "Nakhvamdis"],
          answer: "Kargad var"
        },
        {
          id: "ka-q1-g2",
          type: "write-in",
          question: "'Ben' anlamına gelen Gürcüce şahıs zamirini yazın (მე):",
          answer: "მე"
        },
        {
          id: "ka-q1-g3",
          type: "multiple-choice",
          question: "'როგორ ხარ?' (Rogor khar) sorusunun Türkçe karşılığı nedir?",
          options: ["Kimsin?", "Neredesin?", "Nasılsın?", "Adın ne?"],
          answer: "Nasılsın?"
        },
        {
          id: "ka-q1-g4",
          type: "write-in",
          question: "'Ben Türk'üm' anlamına gelen 'მე ვარ თურქი' cümlesindeki olmak (var) fiilini yazın:",
          answer: "ვარ"
        },
        {
          id: "ka-q1-g5",
          type: "multiple-choice",
          question: "Gürcüce 'კარგი' (Kargi) kelimesinin anlamı nedir?",
          options: ["Kötü", "Yeni", "Tamam / İyi", "Hazır"],
          answer: "Tamam / İyi"
        }
      ],
      pronunciationTarget: {
        phrase: "როგორ ხარ?",
        translation: "Nasılsın?",
        phonetic: "Rogor khar?",
        tip: "'khar' kelimesindeki 'kh' sesini boğazdan, Türkçe hırıltılı 'h' veya Azerbaycan Türkçesindeki 'x' sesi gibi çıkarın."
      }
    },
    {
      id: 2,
      title: "Etap 2: Günlük Yaşam, İhtiyaçlar ve Sorular (Elementary - A2)",
      shortDesc: "Yiyecek ve içecek isimleri, yer sorma ve günlük hayatta istekleri dile getirme.",
      vocab: [
        { id: "ka-2-1", word: "წყალი", translation: "Su", pronunciation: "Tsqali" },
        { id: "ka-2-2", word: "პური", translation: "Ekmek", pronunciation: "Puri" },
        { id: "ka-2-3", word: "მეგობარი", translation: "Arkadaş", pronunciation: "Megobari" },
        { id: "ka-2-4", word: "სად", translation: "Nerede", pronunciation: "Sad" },
        { id: "ka-2-5", word: "რა", translation: "Ne", pronunciation: "Ra" },
        { id: "ka-2-6", word: "ყველი", translation: "Peynir", pronunciation: "Qveli" },
        { id: "ka-2-7", word: "აქ", translation: "Burada", pronunciation: "Ak" },
        { id: "ka-2-8", word: "იქ", translation: "Orada", pronunciation: "Ik" }
      ],
      grammarTitle: "İstek Bildirme 'minda' (İstiyorum) ve Soru Kelimeleri",
      grammarExplanation: "Gürcücede istekler 'მინდა' (minda - istiyorum) kelimesiyle ifade edilir. Sorularda ise 'სად არის...?' (Sad aris...? - ... nerede?) yapısı kullanılır. 'სად' (Sad) soru kelimesidir.",
      grammarExamples: [
        { original: "წყალი მინდა.", translated: "Su istiyorum.", phonetic: "Tsqali minda." },
        { original: "სად არის პური?", translated: "Ekmek nerede?", phonetic: "Sad aris puri?" },
        { original: "ეს რა არის?", translated: "Bu nedir?", phonetic: "Es ra aris?" }
      ],
      vocabQuiz: [
        {
          id: "ka-q2-v1",
          type: "multiple-choice",
          question: "'წყალი' (Tsqali) kelimesinin Türkçe karşılığı nedir?",
          options: ["Ekmek", "Su", "Şarap", "Peynir"],
          answer: "Su"
        },
        {
          id: "ka-q2-v2",
          type: "write-in",
          question: "Gürcücede 'Ekmek' anlamına gelen kelimeyi yazın (პური):",
          answer: "პური"
        },
        {
          id: "ka-q2-v3",
          type: "multiple-choice",
          question: "'ყველი' (Qveli) kelimesinin Türkçe karşılığı nedir?",
          options: ["Ekmek", "Tuz", "Peynir", "Su"],
          answer: "Peynir"
        },
        {
          id: "ka-q2-v4",
          type: "multiple-choice",
          question: "'აქ' (Ak) ve 'იქ' (Ik) sırasıyla ne anlama gelir?",
          options: ["Evet - Hayır", "Nerede - Nasıl", "Burada - Orada", "Bugün - Dün"],
          answer: "Burada - Orada"
        },
        {
          id: "ka-q2-v5",
          type: "write-in",
          question: "Gürcücede 'Arkadaş' anlamına gelen 'მეგობარი' kelimesinin okunuşunu yazın:",
          answer: "megobari"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q2-g1",
          type: "multiple-choice",
          question: "Gürcücede 'Su istiyorum' cümlesi hangisidir?",
          options: ["Puri minda", "Tsqali minda", "Es ra aris", "Sad aris puri"],
          answer: "Tsqali minda"
        },
        {
          id: "ka-q2-g2",
          type: "write-in",
          question: "'İstiyorum' anlamına gelen Gürcüce kelimeyi yazın (მინდა):",
          answer: "მინდა"
        },
        {
          id: "ka-q2-g3",
          type: "multiple-choice",
          question: "'სად არის პური?' (Sad aris puri) cümlesinin Türkçe anlamı nedir?",
          options: ["Su nerede?", "Ekmek nerede?", "Ekmek istiyorum.", "Bu ekmek midir?"],
          answer: "Ekmek nerede?"
        },
        {
          id: "ka-q2-g4",
          type: "write-in",
          question: "'Bu nedir?' anlamına gelen 'ეს რა არის?' cümlesindeki 'Bu' zamirini yazın (ეს):",
          answer: "ეს"
        },
        {
          id: "ka-q2-g5",
          type: "multiple-choice",
          question: "Gürcüce 'is' / 'dir' anlamına gelen yardımcı fiil hangisidir?",
          options: ["var", "khar", "aris", "minda"],
          answer: "aris"
        }
      ],
      pronunciationTarget: {
        phrase: "წყალი მინდა",
        translation: "Su istiyorum",
        phonetic: "Tsqali minda",
        tip: "'Tsqali' derken 'ts' ve 'q' (boğazdan patlamalı k/g arası) seslerini ardı ardına hızlıca söylemeye çalışın."
      }
    },
    {
      id: 3,
      title: "Etap 3: Alışveriş, Seyahat ve Yolculuk (Intermediate - B1)",
      shortDesc: "Yön sorma, bilet alma, otel rezervasyonu ve sayılarla fiyat müzakereleri.",
      vocab: [
        { id: "ka-3-1", word: "ბილეთი", translation: "Bilet", pronunciation: "Bileti" },
        { id: "ka-3-2", word: "სასტუმრო", translation: "Otel", pronunciation: "Sastumro" },
        { id: "ka-3-3", word: "მარცხნივ", translation: "Sol", pronunciation: "Martskhniv" },
        { id: "ka-3-4", word: "მარჯვნივ", translation: "Sağ", pronunciation: "Marjvniv" },
        { id: "ka-3-5", word: "ფასი", translation: "Fiyat", pronunciation: "Pasi" },
        { id: "ka-3-6", word: "მაღაზია", translation: "Mağaza / Dükkan", pronunciation: "Maghazia" },
        { id: "ka-3-7", word: "რკინიგზა", translation: "Demiryolu / Tren istasyonu", pronunciation: "Rkinigza" },
        { id: "ka-3-8", word: "აეროპორტი", translation: "Havalimanı", pronunciation: "Aeroporti" }
      ],
      grammarTitle: "Emir Kipi, Yön Gösterme ve Saygı İfadeleri",
      grammarExplanation: "Yolculuk sırasında yön göstermek için 'მარჯვნივ წადით' (Marjvniv tsadit - Sağa gidin) gibi kibar emir yapıları kullanılır. Soru sorarken ise 'რა ღირს...?' (Ra ghirs...? - ... ne kadar?) kalıbı kullanılır.",
      grammarExamples: [
        { original: "მარჯვნივ წადით.", translated: "Sağa gidin.", phonetic: "Marjvniv tsadit." },
        { original: "სად არის სასტუმრო?", translated: "Otel nerede?", phonetic: "Sad aris sastumro?" },
        { original: "რა ღირს ბილეთი?", translated: "Bilet ne kadar?", phonetic: "Ra ghirs bileti?" }
      ],
      vocabQuiz: [
        {
          id: "ka-q3-v1",
          type: "multiple-choice",
          question: "'სასტუმრო' (Sastumro) kelimesinin Türkçe anlamı nedir?",
          options: ["Mağaza", "Havalimanı", "Otel", "Demiryolu"],
          answer: "Otel"
        },
        {
          id: "ka-q3-v2",
          type: "write-in",
          question: "Gürcücede 'Bilet' anlamına gelen kelimeyi yazın (ბილეთი):",
          answer: "ბილეთი"
        },
        {
          id: "ka-q3-v3",
          type: "multiple-choice",
          question: "'მარცხნივ' (Martskhniv) kelimesinin Türkçe karşılığı hangisidir?",
          options: ["Sağ", "Sol", "Düz", "Yukarı"],
          answer: "Sol"
        },
        {
          id: "ka-q3-v4",
          type: "multiple-choice",
          question: "'აეროპორტი' (Aeroporti) ne demektir?",
          options: ["Tren", "Havalimanı", "Bilet", "Otel"],
          answer: "Havalimanı"
        },
        {
          id: "ka-q3-v5",
          type: "write-in",
          question: "Gürcücede 'Fiyat' anlamına gelen 'ფასი' kelimesinin okunuşunu yazın:",
          answer: "pasi"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q3-g1",
          type: "multiple-choice",
          question: "'Bilet ne kadar?' cümlesinin Gürcücesi hangisidir?",
          options: ["Ra ghirs bileti?", "Sad aris bileti?", "Martskhniv tsadit?", "Es ra aris bileti?"],
          answer: "Ra ghirs bileti?"
        },
        {
          id: "ka-q3-g2",
          type: "write-in",
          question: "'Sağa gidin' cümlesindeki boşluğu doldurun: '___ წადით.' (Sağa)",
          answer: "მარჯვნივ"
        },
        {
          id: "ka-q3-g3",
          type: "multiple-choice",
          question: "'წადით' (tsadit) ne demektir?",
          options: ["Gelin", "Gidin", "Durun", "Konuşun"],
          answer: "Gidin"
        },
        {
          id: "ka-q3-g4",
          type: "write-in",
          question: "Kibarca 'Lütfen' anlamına gelen kelimeyi yazın (გთხოვთ):",
          answer: "გთხოვთ"
        },
        {
          id: "ka-q3-g5",
          type: "multiple-choice",
          question: "'სად არის მაღაზია?' cümlesinin Türkçe anlamı nedir?",
          options: ["Otel nerede?", "Mağaza nerede?", "Mağaza ne kadar?", "Bilet nerede?"],
          answer: "Mağaza nerede?"
        }
      ],
      pronunciationTarget: {
        phrase: "რა ღირს ეს?",
        translation: "Bu ne kadar? / Fiyatı nedir?",
        phonetic: "Ra ghirs es?",
        tip: "'ghirs' kelimesindeki 'gh' sesi, yumuşak g (ğ) sesinin biraz daha hırıltılı ve belirgin halidir."
      }
    },
    {
      id: 4,
      title: "Etap 4: Duygular, Zaman ve Sosyal İlişkiler (Upper-Intermediate - B2)",
      shortDesc: "Duygularınızı ifade etme, geçmiş zaman kullanarak anıları paylaşma.",
      vocab: [
        { id: "ka-4-1", word: "ბედნიერი", translation: "Mutlu", pronunciation: "Bednieri" },
        { id: "ka-4-2", word: "მოწყენილი", translation: "Üzgün", pronunciation: "Motsqenili" },
        { id: "ka-4-3", word: "ოჯახი", translation: "Aile", pronunciation: "Ojaki" },
        { id: "ka-4-4", word: "გუშინ", translation: "Dün", pronunciation: "Gushin" },
        { id: "ka-4-5", word: "სიყვარული", translation: "Sevgi / Aşk", pronunciation: "Siqvaruli" },
        { id: "ka-4-6", word: "ლამაზი", translation: "Güzel", pronunciation: "Lamazi" },
        { id: "ka-4-7", word: "დღეს", translation: "Bugün", pronunciation: "Dghes" },
        { id: "ka-4-8", word: "ხვალ", translation: "Yarın", pronunciation: "Khval" }
      ],
      grammarTitle: "Gürcücede Sıfatların Kullanımı ve Durum Fiilleri",
      grammarExplanation: "Gürcüce sıfatlar isimlerden önce gelir ve ismin yapısına göre uyum sağlarlar. Örneğin 'ლამაზი დღე' (Lamazi dghe) - Güzel gün anlamına gelir. Durum belirten geçmiş eylemlerde 'იყო' (iqo - idi/oldu) kullanılır.",
      grammarExamples: [
        { original: "მე ბედნიერი ვარ.", translated: "Ben mutluyum.", phonetic: "Me bednieri var." },
        { original: "ლამაზი ოჯახი.", translated: "Güzel bir aile.", phonetic: "Lamazi ojaki." },
        { original: "გუშინ კარგი დღე იყო.", translated: "Dün güzel bir gündü.", phonetic: "Gushin kargi dghe iqo." }
      ],
      vocabQuiz: [
        {
          id: "ka-q4-v1",
          type: "multiple-choice",
          question: "'სიყვარული' (Siqvaruli) ne demektir?",
          options: ["Mutlu", "Güzel", "Sevgi / Aşk", "Aile"],
          answer: "Sevgi / Aşk"
        },
        {
          id: "ka-q4-v2",
          type: "write-in",
          question: "Gürcücede 'Dün' anlamına gelen kelimeyi yazın (გუშინ):",
          answer: "გუშინ"
        },
        {
          id: "ka-q4-v3",
          type: "multiple-choice",
          question: "'ხვალ' (Khval) kelimesinin Türkçe karşılığı hangisidir?",
          options: ["Bugün", "Dün", "Yarın", "Gelecek hafta"],
          answer: "Yarın"
        },
        {
          id: "ka-q4-v4",
          type: "multiple-choice",
          question: "'მოწყენილი' (Motsqenili) kelimesinin anlamı nedir?",
          options: ["Mutlu", "Üzgün", "Güzel", "Zengin"],
          answer: "Üzgün"
        },
        {
          id: "ka-q4-v5",
          type: "write-in",
          question: "Gürcücede 'Bugün' anlamına gelen 'დღეს' kelimesinin okunuşunu yazın:",
          answer: "dghes"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q4-g1",
          type: "multiple-choice",
          question: "'Ben mutluyum' cümlesinin doğru Gürcücesi hangisidir?",
          options: ["Me bednieri var", "Me kargad var", "Gushin kargi iqo", "Lamazi dghe var"],
          answer: "Me bednieri var"
        },
        {
          id: "ka-q4-g2",
          type: "write-in",
          question: "'Güzel' anlamına gelen sıfatı Gürcü alfabesiyle yazın (ლამაზი):",
          answer: "ლამაზი"
        },
        {
          id: "ka-q4-g3",
          type: "multiple-choice",
          question: "Geçmiş zamanda 'oldu / idi' anlamına gelen Gürcüce kelime hangisidir?",
          options: ["var", "iqo", "aris", "minda"],
          answer: "iqo"
        },
        {
          id: "ka-q4-g4",
          type: "write-in",
          question: "'Dün güzel bir gündü' anlamına gelen 'გუშინ კარგი დღე იყო' cümlesindeki 'gün' (dghe) kelimesini yazın:",
          answer: "დღე"
        },
        {
          id: "ka-q4-g5",
          type: "multiple-choice",
          question: "'ლამაზი ოჯახი' (Lamazi ojaki) ne demektir?",
          options: ["Güzel arkadaş", "Güzel otel", "Güzel aile", "Büyük şehir"],
          answer: "Güzel aile"
        }
      ],
      pronunciationTarget: {
        phrase: "ძალიან მიყვარხარ",
        translation: "Seni çok seviyorum",
        phonetic: "Dzalian miqvar khar",
        tip: "'dz' sesini Türkçe 'c' ve 'z' arası sert bir sesle başlatın, 'miqvar' kelimesindeki 'q' sesini gırtlaktan çıkarın."
      }
    },
    {
      id: 5,
      title: "Etap 5: Profesyonel İş Dünyası ve Kariyer (Advanced - C1)",
      shortDesc: "İş görüşmeleri, anlaşmalar, profesyonel e-postalar ve resmi yazışma dili.",
      vocab: [
        { id: "ka-5-1", word: "ხელშეკრულება", translation: "Sözleşme / Anlaşma", pronunciation: "Khelshekruleba" },
        { id: "ka-5-2", word: "შეხვედრა", translation: "Toplantı / Buluşma", pronunciation: "Shekhvedra" },
        { id: "ka-5-3", word: "პროექტი", translation: "Proje", pronunciation: "Proekti" },
        { id: "ka-5-4", word: "თანამშრომლობა", translation: "İş birliği", pronunciation: "Tanamshromloba" },
        { id: "ka-5-5", word: "მენეჯერი", translation: "Müdür / Yönetici", pronunciation: "Menejeri" },
        { id: "ka-5-6", word: "ვადა", translation: "Süre / Son teslim tarihi", pronunciation: "Vada" },
        { id: "ka-5-7", word: "შემოთავაზება", translation: "Teklif / Öneri", pronunciation: "Shemotavazeba" },
        { id: "ka-5-8", word: "წარმატება", translation: "Başarı", pronunciation: "Tsarmateba" }
      ],
      grammarTitle: "Gürcücede Karmaşık Cümle Yapıları ve Koşul İfadeleri",
      grammarExplanation: "Gürcüce resmi dilde 'თუ' (tu - eğer/ise) kelimesiyle koşul cümleleri kurulur. 'რომ' (rom - ki/olduğunu) bağlacı ise karmaşık cümleleri birbirine bağlamada hayati önem taşır.",
      grammarExamples: [
        { original: "თუ შეხვედრა იქნება, მოვალ.", translated: "Eğer toplantı olursa geleceğim.", phonetic: "Tu shekhvedra ikneba, moval." },
        { original: "ხელშეკრულება უნდა მოვამზადოთ.", translated: "Sözleşmeyi hazırlamalıyız.", phonetic: "Khelshekruleba unda movamzadot." },
        { original: "გისურვებთ წარმატებას!", translated: "Başarılar dilerim!", phonetic: "Gisurvebt tsarmatebas!" }
      ],
      vocabQuiz: [
        {
          id: "ka-q5-v1",
          type: "multiple-choice",
          question: "'ხელშეკრულება' (Khelshekruleba) kelimesinin Türkçe karşılığı nedir?",
          options: ["Proje", "Toplantı", "Sözleşme / Anlaşma", "Yönetici"],
          answer: "Sözleşme / Anlaşma"
        },
        {
          id: "ka-q5-v2",
          type: "write-in",
          question: "Gürcücede 'Başarı' anlamına gelen kelimeyi yazın (წარმატება):",
          answer: "წარმატება"
        },
        {
          id: "ka-q5-v3",
          type: "multiple-choice",
          question: "'შეხვედრა' (Shekhvedra) kelimesinin anlamı nedir?",
          options: ["Sözleşme", "Toplantı / Buluşma", "İş birliği", "Proje"],
          answer: "Toplantı / Buluşma"
        },
        {
          id: "ka-q5-v4",
          type: "multiple-choice",
          question: "'თანამშრომლობა' (Tanamshromloba) kelimesinin anlamı nedir?",
          options: ["İş birliği", "Yönetici", "Süre", "Teklif"],
          answer: "İş birliği"
        },
        {
          id: "ka-q5-v5",
          type: "write-in",
          question: "Gürcücede 'Proje' anlamına gelen kelimeyi yazın (პროექტი):",
          answer: "პროექტი"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q5-g1",
          type: "multiple-choice",
          question: "Gürcücede 'Eğer' anlamına gelen koşul kelimesi hangisidir?",
          options: ["rom", "tu", "unda", "aris"],
          answer: "tu"
        },
        {
          id: "ka-q5-g2",
          type: "write-in",
          question: "'Geleceğim' anlamına gelen Gürcüce fiili yazın (მოვალ):",
          answer: "მოვალ"
        },
        {
          id: "ka-q5-g3",
          type: "multiple-choice",
          question: "'გისურვებთ წარმატებას!' (Gisurvebt tsarmatebas) cümlesinin anlamı nedir?",
          options: ["İş birliği dilerim!", "Başarılar dilerim!", "Toplantı başladı!", "Sözleşme imzalandı!"],
          answer: "Başarılar dilerim!"
        },
        {
          id: "ka-q5-g4",
          type: "write-in",
          question: "Gereklilik bildiren 'mali/meli' anlamındaki 'unda' kelimesini Gürcü alfabesiyle yazın (უნდა):",
          answer: "უნდა"
        },
        {
          id: "ka-q5-g5",
          type: "multiple-choice",
          question: "Gürcüce 'თუ შეხვედრა იქნება' ne demektir?",
          options: ["Eğer toplantı olursa", "Toplantıyı iptal et", "Toplantı sona erdi", "Bu bir toplantıdır"],
          answer: "Eğer toplantı olursa"
        }
      ],
      pronunciationTarget: {
        phrase: "გისურვებთ წარმატებას",
        translation: "Başarılar dilerim",
        phonetic: "Gisurvebt tsarmatebas",
        tip: "'tsarmatebas' derken baştaki 'ts' sesini patlamalı ve net bir şekilde çıkarın."
      }
    },
    {
      id: 6,
      title: "Etap 6: Diplomatik İfade ve Kültürel Retorik (Professional - C2)",
      shortDesc: "Akademik münazaralar, diplomatik müzakereler ve Gürcüce edebi, felsefi yapılar.",
      vocab: [
        { id: "ka-6-1", word: "განვითარება", translation: "Kalkınma / Gelişme", pronunciation: "Ganvitareba" },
        { id: "ka-6-2", word: "სტრატეგია", translation: "Strateji", pronunciation: "Strategia" },
        { id: "ka-6-3", word: "კულტურა", translation: "Kültür", pronunciation: "Kultura" },
        { id: "ka-6-4", word: "მოლაპარაკება", translation: "Müzakere / Görüşme", pronunciation: "Molaparakeba" },
        { id: "ka-6-5", word: "გადაწყვეტილება", translation: "Karar", pronunciation: "Gadatshvetileba" },
        { id: "ka-6-6", word: "ინტეგრაცია", translation: "Entegrasyon", pronunciation: "Integratsia" },
        { id: "ka-6-7", word: "პრიორიტეტი", translation: "Öncelik", pronunciation: "Prioriteti" },
        { id: "ka-6-8", word: "კონსენსუსი", translation: "Fikir birliği / Konsensüs", pronunciation: "Konsensusi" }
      ],
      grammarTitle: "İleri Seviye Bağlaçlar ve Edebi Anlatım Yapıları",
      grammarExplanation: "Gürcüce akademik dilde karmaşık edilgen yapılar ve 'შესაბამისად' (shesabamisad - dolayısıyla) gibi üst düzey mantıksal bağlaçlar sıkça kullanılır.",
      grammarExamples: [
        { original: "ეს სტრატეგია მნიშვნელოვანია.", translated: "Bu strateji önemlidir.", phonetic: "Es strategia mshnishvnelovania." },
        { original: "მივიღეთ ერთობლივი გადაწყვეტილება.", translated: "Ortak bir karar aldık.", phonetic: "Mivighet ertoblivi gadatshvetileba." },
        { original: "კონსენსუსი მიღწეულია.", translated: "Uzlaşmaya varıldı (Konsensüs sağlandı).", phonetic: "Konsensusi mightseulia." }
      ],
      vocabQuiz: [
        {
          id: "ka-q6-v1",
          type: "multiple-choice",
          question: "'გადაწყვეტილება' (Gadatshvetileba) ne demektir?",
          options: ["Strateji", "Gelişme", "Karar", "Kültür"],
          answer: "Karar"
        },
        {
          id: "ka-q6-v2",
          type: "write-in",
          question: "Gürcücede 'Kültür' anlamına gelen kelimeyi yazın (კულტურა):",
          answer: "კულტურა"
        },
        {
          id: "ka-q6-v3",
          type: "multiple-choice",
          question: "'განვითარება' (Ganvitareba) kelimesinin anlamı nedir?",
          options: ["Müzakere", "Kalkınma / Gelişme", "Öncelik", "Karar"],
          answer: "Kalkınma / Gelişme"
        },
        {
          id: "ka-q6-v4",
          type: "multiple-choice",
          question: "'მოლაპარაკება' (Molaparakeba) kelimesinin anlamı nedir?",
          options: ["Müzakere / Görüşme", "Uzlaşı", "Kalkınma", "Strateji"],
          answer: "Müzakere / Görüşme"
        },
        {
          id: "ka-q6-v5",
          type: "write-in",
          question: "Gürcücede 'Strateji' kelimesini Gürcü alfabesiyle yazın (სტრატეგია):",
          answer: "სტრატეგია"
        }
      ],
      grammarQuiz: [
        {
          id: "ka-q6-g1",
          type: "multiple-choice",
          question: "Gürcücede 'Ortak karar aldık' cümlesi hangisidir?",
          options: ["Mivighet ertoblivi gadatshvetileba", "Es strategia mshnishvnelovania", "Konsensusi mightseulia", "Kargad var mightseulia"],
          answer: "Mivighet ertoblivi gadatshvetileba"
        },
        {
          id: "ka-q6-g2",
          type: "write-in",
          question: "'Bu strateji önemlidir' anlamına gelen 'ეს სტრატეგია მნიშვნელოვანია' cümlesindeki 'strateji' (სტრატეგია) kelimesini yazın:",
          answer: "სტრატეგია"
        },
        {
          id: "ka-q6-g3",
          type: "multiple-choice",
          question: "'კონსენსუსი მიღწეულია' (Konsensusi mightseulia) ne demektir?",
          options: ["Karara varılamadı.", "Uzlaşmaya varıldı.", "Toplantıyı erteleyin.", "Stratejiyi değiştirin."],
          answer: "Uzlaşmaya varıldı."
        },
        {
          id: "ka-q6-g4",
          type: "write-in",
          question: "Gürcüce 'Bu' anlamına gelen kelimeyi yazın (ეს):",
          answer: "ეს"
        },
        {
          id: "ka-q6-g5",
          type: "multiple-choice",
          question: "Edebi dilde 'Dolayısıyla/Bu doğrultuda' anlamına gelen C2 kelime hangisidir?",
          options: ["shesabamisad", "gadatshvetileba", "prioriteti", "mightseulia"],
          answer: "shesabamisad"
        }
      ],
      pronunciationTarget: {
        phrase: "გადაწყვეტილება მიღებულია",
        translation: "Karar verilmiştir",
        phonetic: "Gadatshvetileba mighebulia",
        tip: "'gadatshvetileba' kelimesini söylerken hecelere bölerek yavaşça okuyun, 'ts' ve 'v' seslerini netleştirin."
      }
    }
  ],

  // Curriculum for learning Turkish (Türkçe Öğrenimi - Sıfırdan Profesyonele)
  tr: [
    {
      id: 1,
      title: "Etap 1: Temel Tanışma ve Selamlaşma (Beginner - A1)",
      shortDesc: "Türkçeye harika bir başlangıç yapın! Tanışma, temel nezaket sözleri ve şahıs zamirleri.",
      vocab: [
        { id: "tr-1-1", word: "Merhaba", translation: "Hello", pronunciation: "Mare-ha-ba" },
        { id: "tr-1-2", word: "Teşekkürler", translation: "Thank you / Thanks", pronunciation: "Te-shek-kur-ler" },
        { id: "tr-1-3", word: "Evet", translation: "Yes", pronunciation: "Eh-vet" },
        { id: "tr-1-4", word: "Hayır", translation: "No", pronunciation: "Ha-yur" },
        { id: "tr-1-5", word: "Lütfen", translation: "Please", pronunciation: "Lut-fen" },
        { id: "tr-1-6", word: "Nasılsın?", translation: "How are you?", pronunciation: "Nah-sul-sun" },
        { id: "tr-1-7", word: "Günaydın", translation: "Good morning", pronunciation: "Goo-nay-dun" },
        { id: "tr-1-8", word: "Hoşça kal", translation: "Goodbye", pronunciation: "Hosh-chah kahl" }
      ],
      grammarTitle: "Türkçede Cümle Yapısı (Özne + Nesne + Yüklem) ve Şahıs Ekleri",
      grammarExplanation: "Türkçe sondan eklemeli bir dildir. Cümleler genellikle 'Özne + Nesne + Yüklem' yapısındadır. Zamirlerimiz: Ben (I), Sen (You), O (He/She/It), Biz (We), Siz (You plural), Onlar (They). İsim soylu yüklemler şahıs ekleri alır (-ım/-im, -sın/-sin vb.).",
      grammarExamples: [
        { original: "Ben öğretmenim.", translated: "I am a teacher." },
        { original: "Sen nasılsın?", translated: "How are you?" },
        { original: "Biz hazırız.", translated: "We are ready." }
      ],
      vocabQuiz: [
        {
          id: "tr-q1-v1",
          type: "multiple-choice",
          question: "What is the meaning of 'Teşekkürler' in English?",
          options: ["Please", "Hello", "Thank you", "Goodbye"],
          answer: "Thank you"
        },
        {
          id: "tr-q1-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Please' (First letter capital):",
          answer: "Lütfen"
        },
        {
          id: "tr-q1-v3",
          type: "multiple-choice",
          question: "What is the Turkish equivalent of 'Good morning'?",
          options: ["Hoşça kal", "Merhaba", "Günaydın", "Evet"],
          answer: "Günaydın"
        },
        {
          id: "tr-q1-v4",
          type: "multiple-choice",
          question: "What is the English meaning of 'Hoşça kal'?",
          options: ["Hello", "Goodbye", "Yes", "Please"],
          answer: "Goodbye"
        },
        {
          id: "tr-q1-v5",
          type: "write-in",
          question: "Write the Turkish word for 'No':",
          answer: "Hayır"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q1-g1",
          type: "multiple-choice",
          question: "Which suffix is used for 'I am' in 'Ben öğrenci___' (I am a student)?",
          options: ["-sin", "-yim", "-siniz", "-ler"],
          answer: "-yim"
        },
        {
          id: "tr-q1-g2",
          type: "write-in",
          question: "Fill in the blank for 'How are you?': 'Nasıl___?'",
          answer: "sın"
        },
        {
          id: "tr-q1-g3",
          type: "multiple-choice",
          question: "How do you say 'We are ready' in Turkish? (Ready = Hazır)",
          options: ["Hazırım", "Hazırsın", "Hazırız", "Hazırlar"],
          answer: "Hazırız"
        },
        {
          id: "tr-q1-g4",
          type: "write-in",
          question: "Complete the sentence: 'Ben bir ___.' (I am a teacher - Teacher = Öğretmen)",
          answer: "öğretmenim"
        },
        {
          id: "tr-q1-g5",
          type: "multiple-choice",
          question: "What does 'O çok iyi' mean in English?",
          options: ["I am very good.", "You are very good.", "He/She/It is very good.", "They are very good."],
          answer: "He/She/It is very good."
        }
      ],
      pronunciationTarget: {
        phrase: "Tanıştığıma memnun oldum",
        translation: "Nice to meet you",
        phonetic: "Tah-nish-tuh-uh-mah mem-noon ol-doom",
        tip: "Pronounce the soft 'ğ' by slightly extending the preceding vowel 'ı' like 'tah-nish-tuh-mah'."
      }
    },
    {
      id: 2,
      title: "Etap 2: Günlük Yaşam, İhtiyaçlar ve Sorular (Elementary - A2)",
      shortDesc: "Yiyecek ve içecekler, konum bildirme ve soru eki kullanımı.",
      vocab: [
        { id: "tr-2-1", word: "Su", translation: "Water", pronunciation: "Soo" },
        { id: "tr-2-2", word: "Ekmek", translation: "Bread", pronunciation: "Ek-mek" },
        { id: "tr-2-3", word: "Arkadaş", translation: "Friend", pronunciation: "Ar-kah-dash" },
        { id: "tr-2-4", word: "Nerede?", translation: "Where?", pronunciation: "Ne-re-de" },
        { id: "tr-2-5", word: "Ne kadar?", translation: "How much?", pronunciation: "Ne kah-dar" },
        { id: "tr-2-6", word: "Peynir", translation: "Cheese", pronunciation: "Pey-neer" },
        { id: "tr-2-7", word: "Burada", translation: "Here", pronunciation: "Boo-rah-dah" },
        { id: "tr-2-8", word: "Orada", translation: "There", pronunciation: "Oh-rah-dah" }
      ],
      grammarTitle: "Bulunma Durumu Eki (-de/-da) ve Soru Eki (-mi/-mı/-mu/-mü)",
      grammarExplanation: "Bir şeyin nerede bulunduğunu belirtmek için kelimelerin sonuna ses uyumuna göre -de, -da, -te, -ta eklenir (evde, okulda, markette). Soru sormak için ise ayrı yazılan 'mi, mı, mu, mü' ekleri kullanılır.",
      grammarExamples: [
        { original: "Ekmek nerede?", translated: "Where is the bread?" },
        { original: "Su istiyor musun?", translated: "Do you want water?" },
        { original: "Ben evdeyim.", translated: "I am at home." }
      ],
      vocabQuiz: [
        {
          id: "tr-q2-v1",
          type: "multiple-choice",
          question: "What does 'Ekmek' mean in English?",
          options: ["Water", "Bread", "Cheese", "Tea"],
          answer: "Bread"
        },
        {
          id: "tr-q2-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Friend':",
          answer: "Arkadaş"
        },
        {
          id: "tr-q2-v3",
          type: "multiple-choice",
          question: "What does 'Peynir' mean?",
          options: ["Bread", "Butter", "Cheese", "Olive"],
          answer: "Cheese"
        },
        {
          id: "tr-q2-v4",
          type: "multiple-choice",
          question: "Which Turkish word means 'How much?'",
          options: ["Nerede?", "Ne kadar?", "Nasıl?", "Neden?"],
          answer: "Ne kadar?"
        },
        {
          id: "tr-q2-v5",
          type: "write-in",
          question: "Write the Turkish word for 'Water':",
          answer: "Su"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q2-g1",
          type: "multiple-choice",
          question: "How do you say 'Are you at home?' in Turkish? (Home = Ev)",
          options: ["Evde misin?", "Ev misin?", "Evdeyim mi?", "Ev nerede?"],
          answer: "Evde misin?"
        },
        {
          id: "tr-q2-g2",
          type: "write-in",
          question: "Fill in the blank for 'Where is the friend?': 'Arkadaş ___?'",
          answer: "nerede"
        },
        {
          id: "tr-q2-g3",
          type: "multiple-choice",
          question: "What is the locative suffix ('at/on/in') for 'School' in Turkish? (School = Okul)",
          options: ["Okulda", "Okulde", "Okula", "Okulu"],
          answer: "Okulda"
        },
        {
          id: "tr-q2-g4",
          type: "write-in",
          question: "Fill in the blank to say 'Do you want?': 'İstiyor ___?'",
          answer: "musun"
        },
        {
          id: "tr-q2-g5",
          type: "multiple-choice",
          question: "What is the meaning of 'Ben marketteyim'?",
          options: ["I am going to the market.", "I am at the market.", "Where is the market?", "We are in the market."],
          answer: "I am at the market."
        }
      ],
      pronunciationTarget: {
        phrase: "Çok teşekkür ederim",
        translation: "Thank you very much",
        phonetic: "Chok te-shek-kur e-de-rim",
        tip: "Pronounce 'Ç' like the 'ch' in 'chair', and make sure to tap the 'r' in 'ederim' lightly."
      }
    },
    {
      id: 3,
      title: "Etap 3: Alışveriş, Seyahat ve Ulaşım (Intermediate - B1)",
      shortDesc: "Yolculuk, yönler, bilet satın alma ve istek kipi cümleleri kurma.",
      vocab: [
        { id: "tr-3-1", word: "Bilet", translation: "Ticket", pronunciation: "Bee-let" },
        { id: "tr-3-2", word: "Otel", translation: "Hotel", pronunciation: "Oh-tel" },
        { id: "tr-3-3", word: "Sol", translation: "Left", pronunciation: "Sol" },
        { id: "tr-3-4", word: "Sağ", translation: "Right", pronunciation: "Sah" },
        { id: "tr-3-5", word: "Fiyat", translation: "Price", pronunciation: "Fee-yat" },
        { id: "tr-3-6", word: "Düz", translation: "Straight", pronunciation: "Duz" },
        { id: "tr-3-7", word: "Havalimanı", translation: "Airport", pronunciation: "Ha-va-lee-mah-nuh" },
        { id: "tr-3-8", word: "Pasaport", translation: "Passport", pronunciation: "Pa-sah-port" }
      ],
      grammarTitle: "Yönelme Durumu Eki (-e/-a) ve İstek Kipi (-eyim/-ayım)",
      grammarExplanation: "Bir yere yöneldiğimizi göstermek için kelimelerin sonuna ses uyumlarına göre -e veya -a eklenir (okula, otele, havalimanına). Kendi isteklerimizi veya önerilerimizi belirtirken fiilin sonuna istek kipi eklenir.",
      grammarExamples: [
        { original: "Otele gidiyorum.", translated: "I am going to the hotel." },
        { original: "Bilet alayım.", translated: "Let me buy a ticket." },
        { original: "Sola dönün.", translated: "Turn left." }
      ],
      vocabQuiz: [
        {
          id: "tr-q3-v1",
          type: "multiple-choice",
          question: "What is the Turkish word for 'Left'?",
          options: ["Sağ", "Sol", "Düz", "Aşağı"],
          answer: "Sol"
        },
        {
          id: "tr-q3-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Passport':",
          answer: "Pasaport"
        },
        {
          id: "tr-q3-v3",
          type: "multiple-choice",
          question: "What is the English meaning of 'Fiyat'?",
          options: ["Ticket", "Price", "Bill", "Hotel"],
          answer: "Price"
        },
        {
          id: "tr-q3-v4",
          type: "multiple-choice",
          question: "Which Turkish word means 'Airport'?",
          options: ["Otogar", "Liman", "Havalimanı", "İstasyon"],
          answer: "Havalimanı"
        },
        {
          id: "tr-q3-v5",
          type: "write-in",
          question: "Write the Turkish word for 'Ticket':",
          answer: "Bilet"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q3-g1",
          type: "multiple-choice",
          question: "Which of these means 'I am going to school' in Turkish? (School = Okul, Go = Gitmek)",
          options: ["Okul gidiyorum.", "Okula gidiyorum.", "Okulda gidiyorum.", "Okulun gidiyorum."],
          answer: "Okula gidiyorum."
        },
        {
          id: "tr-q3-g2",
          type: "write-in",
          question: "Fill in the blank to say 'Let me help you': 'Yardım ___.' (etmek verb past/suggestion form)",
          answer: "edeyim"
        },
        {
          id: "tr-q3-g3",
          type: "multiple-choice",
          question: "How do you say 'Turn right' in Turkish? (Right = Sağ, Turn = Dönmek)",
          options: ["Sola dönün.", "Sağa dönün.", "Düz gidin.", "Sağda kalın."],
          answer: "Sağa dönün."
        },
        {
          id: "tr-q3-g4",
          type: "write-in",
          question: "Fill in the directional blank: 'Gidiyorum. Nereye? Otel___.' (To the hotel)",
          answer: "e"
        },
        {
          id: "tr-q3-g5",
          type: "multiple-choice",
          question: "What is the meaning of 'Bilet alayım'?",
          options: ["Do you have a ticket?", "Let me buy a ticket.", "I am buying a ticket.", "Buy a ticket!"],
          answer: "Let me buy a ticket."
        }
      ],
      pronunciationTarget: {
        phrase: "Hesap lütfen",
        translation: "The bill, please",
        phonetic: "Heh-sap lut-fen",
        tip: "Pronounce 'ü' in 'lütfen' like the French 'u' in 'tu' or German 'ü' in 'über'."
      }
    },
    {
      id: 4,
      title: "Etap 4: Duygular, Sosyal İlişkiler ve Geçmiş (Upper-Intermediate - B2)",
      shortDesc: "Duyguları ifade etme ve görülen geçmiş zaman kipini kullanma.",
      vocab: [
        { id: "tr-4-1", word: "Mutlu", translation: "Happy", pronunciation: "Moot-loo" },
        { id: "tr-4-2", word: "Üzgün", translation: "Sad", pronunciation: "Uz-gun" },
        { id: "tr-4-3", word: "Kızgın", translation: "Angry", pronunciation: "Kuz-gun" },
        { id: "tr-4-4", word: "Dün", translation: "Yesterday", pronunciation: "Dun" },
        { id: "tr-4-5", word: "Aile", translation: "Family", pronunciation: "Ah-ee-le" },
        { id: "tr-4-6", word: "Sevgi", translation: "Love", pronunciation: "Sev-gee" },
        { id: "tr-4-7", word: "Heyecanlı", translation: "Excited", pronunciation: "Hey-e-can-luh" },
        { id: "tr-4-8", word: "Birlikte", translation: "Together", pronunciation: "Beer-lik-te" }
      ],
      grammarTitle: "Görülen Geçmiş Zaman Eki (-di / -dı / -du / -dü / -ti / -tı / -tu / -tü)",
      grammarExplanation: "Geçmişte yaşanmış ve şahit olunmuş olayları anlatmak için fiil köküne ses uyumuna göre -di eklenir. Eğer fiil sert ünsüzle (f, s, t, k, ç, ş, h, p) bitiyorsa ek sertleşerek -ti haline gelir.",
      grammarExamples: [
        { original: "Dün okula gittim.", translated: "I went to school yesterday." },
        { original: "Çok mutlu oldum.", translated: "I became very happy." },
        { original: "Birlikte yemek yedik.", translated: "We ate food together." }
      ],
      vocabQuiz: [
        {
          id: "tr-q4-v1",
          type: "multiple-choice",
          question: "What does 'Üzgün' mean in English?",
          options: ["Happy", "Sad", "Angry", "Excited"],
          answer: "Sad"
        },
        {
          id: "tr-q4-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Family':",
          answer: "Aile"
        },
        {
          id: "tr-q4-v3",
          type: "multiple-choice",
          question: "What is the Turkish word for 'Together'?",
          options: ["Yalnız", "Birlikte", "Her zaman", "Dün"],
          answer: "Birlikte"
        },
        {
          id: "tr-q4-v4",
          type: "multiple-choice",
          question: "What does 'Heyecanlı' mean?",
          options: ["Excited", "Sad", "Calm", "Angry"],
          answer: "Excited"
        },
        {
          id: "tr-q4-v5",
          type: "write-in",
          question: "Write the Turkish word for 'Yesterday':",
          answer: "Dün"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q4-g1",
          type: "multiple-choice",
          question: "How do you say 'I watched a movie yesterday' in Turkish? (Watch = İzlemek, Movie = Film)",
          options: ["Dün film izlerim.", "Dün film izledim.", "Dün film izliyorum.", "Dün film izleyeceğim."],
          answer: "Dün film izledim."
        },
        {
          id: "tr-q4-g2",
          type: "write-in",
          question: "Fill in the past tense blank for 'We went': 'Git___.' (Go = Gitmek)",
          answer: "tik"
        },
        {
          id: "tr-q4-g3",
          type: "multiple-choice",
          question: "Why does 'gitmek' past tense become 'gittim' (with 't') instead of 'giddim'?",
          options: ["Vowel harmony", "Consonant voicing", "Consonant hardening (Sertleşme)", "Grammatical gender"],
          answer: "Consonant hardening (Sertleşme)"
        },
        {
          id: "tr-q4-g4",
          type: "write-in",
          question: "Fill in the blank for 'I was very happy yesterday': 'Dün çok mutlu ___.'",
          answer: "oldum"
        },
        {
          id: "tr-q4-g5",
          type: "multiple-choice",
          question: "What is the meaning of 'Onlar bizi ziyaret ettiler'?",
          options: ["They are visiting us.", "They visited us.", "We visited them.", "They will visit us."],
          answer: "They visited us."
        }
      ],
      pronunciationTarget: {
        phrase: "Seni çok seviyorum",
        translation: "I love you very much",
        phonetic: "Seh-nee chok seh-vee-yo-room",
        tip: "Pronounce 'ş' in 'çok' like 'ch' but softer as 'sh' (seviyorum uses a gentle, voiced 'v')."
      }
    },
    {
      id: 5,
      title: "Etap 5: Profesyonel İş Dünyası ve Kariyer (Advanced - C1)",
      shortDesc: "İş görüşmeleri, anlaşmalar, sunumlar ve profesyonel yazışmalar.",
      vocab: [
        { id: "tr-5-1", word: "Sözleşme", translation: "Agreement / Contract", pronunciation: "Soz-lesh-me" },
        { id: "tr-5-2", word: "Toplantı", translation: "Meeting", pronunciation: "Top-lahn-tuh" },
        { id: "tr-5-3", word: "İş birliği", translation: "Collaboration", pronunciation: "Eesh beer-lee-yee" },
        { id: "tr-5-4", word: "Süre", translation: "Deadline / Duration", pronunciation: "Su-re" },
        { id: "tr-5-5", word: "Performans", translation: "Performance", pronunciation: "Per-for-mahns" },
        { id: "tr-5-6", word: "Müzakere", translation: "Negotiation", pronunciation: "Mu-zah-ke-re" },
        { id: "tr-5-7", word: "Teklif", translation: "Proposal / Offer", pronunciation: "Tek-leef" },
        { id: "tr-5-8", word: "Yönetici", translation: "Manager / Executive", pronunciation: "Yo-ne-tee-cee" }
      ],
      grammarTitle: "Koşul Kipi (-se / -sa) ve Karmaşık Cümle Yapıları",
      grammarExplanation: "Koşul bildiren durumlarda eylemlere ses uyumlarına göre -se/-sa eklenir (yaparsak, gelirseniz). Bu kural karmaşık iş teklifleri ve olasılık cümlelerinde sıklıkla tercih edilir.",
      grammarExamples: [
        { original: "Sözleşmeyi imzalarsak, haftaya başlayacağız.", translated: "If we sign the contract, we will start next week." },
        { original: "Yönetici olsaydım, süreyi değiştirirdim.", translated: "If I were the manager, I would change the deadline." },
        { original: "İlgi duyarsanız iş birliği yapabiliriz.", translated: "If you are interested, we can collaborate." }
      ],
      vocabQuiz: [
        {
          id: "tr-q5-v1",
          type: "multiple-choice",
          question: "What does 'Sözleşme' mean in English?",
          options: ["Meeting", "Contract / Agreement", "Proposal", "Executive"],
          answer: "Contract / Agreement"
        },
        {
          id: "tr-q5-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Collaboration':",
          answer: "İş birliği"
        },
        {
          id: "tr-q5-v3",
          type: "multiple-choice",
          question: "What does 'Toplantı' mean?",
          options: ["Deadline", "Meeting", "Negotiation", "Executive"],
          answer: "Meeting"
        },
        {
          id: "tr-q5-v4",
          type: "multiple-choice",
          question: "What is the Turkish word for 'Manager'?",
          options: ["Yönetici", "Sözleşme", "Süre", "Teklif"],
          answer: "Yönetici"
        },
        {
          id: "tr-q5-v5",
          type: "write-in",
          question: "Write the Turkish word for 'Proposal / Offer':",
          answer: "Teklif"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q5-g1",
          type: "multiple-choice",
          question: "Which suffix represents the conditional ('if') in Turkish?",
          options: ["-yor / -ar", "-se / -sa", "-di / -dı", "-meli / -malı"],
          answer: "-se / -sa"
        },
        {
          id: "tr-q5-g2",
          type: "write-in",
          question: "Fill in the conditional blank for 'If you work': 'Çalışır___ başarılı olursun.' (you singular)",
          answer: "san"
        },
        {
          id: "tr-q5-g3",
          type: "multiple-choice",
          question: "What is the English meaning of 'Yönetici olsaydım süreyi değiştirirdim'?",
          options: ["I am the manager, so I will change the deadline.", "If I were the manager, I would change the deadline.", "The manager changed the deadline yesterday.", "I want to be the manager to change the deadline."],
          answer: "If I were the manager, I would change the deadline."
        },
        {
          id: "tr-q5-g4",
          type: "write-in",
          question: "Fill in the blank for 'If we sign the agreement': 'Sözleşmeyi imzalar___ başlayacağız.' (we)",
          answer: "sak"
        },
        {
          id: "tr-q5-g5",
          type: "multiple-choice",
          question: "What is the meaning of 'İş birliği yapabiliriz'?",
          options: ["We must collaborate.", "We can collaborate.", "We collaborated.", "Will you collaborate?"],
          answer: "We can collaborate."
        }
      ],
      pronunciationTarget: {
        phrase: "İş birliği teklifini kabul ediyoruz",
        translation: "We accept the collaboration proposal",
        phonetic: "Eesh beer-lee-yee tek-lee-fee-nee kah-bool e-dee-yo-rooz",
        tip: "Pronounce 'kabul' with a soft, long 'a' and a clear, thin 'l' at the end."
      }
    },
    {
      id: 6,
      title: "Etap 6: Diplomatik Retorik ve Akademik Tartışma (Professional - C2)",
      shortDesc: "Üst düzey toplantılarda uzlaşı sağlama, stratejik planlama ve diplomatik ifadeler.",
      vocab: [
        { id: "tr-6-1", word: "Kalkınma", translation: "Development / Growth", pronunciation: "Kal-kun-mah" },
        { id: "tr-6-2", word: "Strateji", translation: "Strategy", pronunciation: "Stra-te-jee" },
        { id: "tr-6-3", word: "Sürdürülebilir", translation: "Sustainable", pronunciation: "Sur-du-ru-le-bee-leer" },
        { id: "tr-6-4", word: "Görüşme", translation: "Negotiation / Meeting", pronunciation: "Go-rush-me" },
        { id: "tr-6-5", word: "Karar", translation: "Decision / Resolution", pronunciation: "Kah-rar" },
        { id: "tr-6-6", word: "Entegrasyon", translation: "Integration", pronunciation: "En-teg-ras-yon" },
        { id: "tr-6-7", word: "Öncelik", translation: "Priority", pronunciation: "On-ce-leek" },
        { id: "tr-6-8", word: "Uzlaşı", translation: "Consensus", pronunciation: "Oo-zlah-shuh" }
      ],
      grammarTitle: "Edilgen Çatı (-il / -in) ve Akademik Mantık Bağlaçları",
      grammarExplanation: "Profesyonel ve diplomatik dilde edilgen çatı (-il, -in ekleri: 'yapıldı', 'alındı') sıkça kullanılır. 'Dolayısıyla' ve 'Bu doğrultuda' gibi bağlaçlar ise mantıksal geçişler kurmada kilit role sahiptir.",
      grammarExamples: [
        { original: "Stratejik plan başarıyla uygulamaya konuldu.", translated: "The strategic plan was implemented successfully." },
        { original: "Sürdürülebilir bir çerçeve oluşturulmalıdır.", translated: "A sustainable framework must be created." },
        { original: "Yönetim kurulu tarafından uzlaşı sağlandı.", translated: "Consensus has been reached by the board." }
      ],
      vocabQuiz: [
        {
          id: "tr-q6-v1",
          type: "multiple-choice",
          question: "What does 'Sürdürülebilir' mean?",
          options: ["Feasible", "Sustainable", "Strategic", "Temporary"],
          answer: "Sustainable"
        },
        {
          id: "tr-q6-v2",
          type: "write-in",
          question: "Write the Turkish word for 'Consensus':",
          answer: "Uzlaşı"
        },
        {
          id: "tr-q6-v3",
          type: "multiple-choice",
          question: "What is the English meaning of 'Karar'?",
          options: ["Negotiation", "Decision", "Priority", "Strategy"],
          answer: "Decision"
        },
        {
          id: "tr-q6-v4",
          type: "multiple-choice",
          question: "Which Turkish word means 'Priority'?",
          options: ["Karar", "Uzlaşı", "Öncelik", "Strateji"],
          answer: "Öncelik"
        },
        {
          id: "tr-q6-v5",
          type: "write-in",
          question: "Write the Turkish word for 'Strategy':",
          answer: "Strateji"
        }
      ],
      grammarQuiz: [
        {
          id: "tr-q6-g1",
          type: "multiple-choice",
          question: "Which of these is a passive voice sentence (Edilgen Çatı)?",
          options: ["Kararı aldık.", "Karar alındı.", "Karar alacağız.", "Karar almak istiyoruz."],
          answer: "Karar alındı."
        },
        {
          id: "tr-q6-g2",
          type: "write-in",
          question: "Fill in the passive suffix blank for 'It was made': 'Yap___dı.'",
          answer: "ıl"
        },
        {
          id: "tr-q6-g3",
          type: "multiple-choice",
          question: "What does 'Sürdürülebilir bir çerçeve oluşturulmalıdır' mean?",
          options: ["We are creating a sustainable framework.", "A sustainable framework must be created.", "Sustainable frameworks are easy.", "We created a sustainable framework."],
          answer: "A sustainable framework must be created."
        },
        {
          id: "tr-q6-g4",
          type: "write-in",
          question: "Write the Turkish logic connector that means 'Therefore / Consequently' (Dolayısıyla):",
          answer: "Dolayısıyla"
        },
        {
          id: "tr-q6-g5",
          type: "multiple-choice",
          question: "What is the meaning of 'Yönetim kurulu tarafından uzlaşı sağlandı'?",
          options: ["The board of directors is fighting.", "Consensus has been reached by the board of directors.", "We need to get consensus from the board of directors.", "The board rejected the consensus."],
          answer: "Consensus has been reached by the board of directors."
        }
      ],
      pronunciationTarget: {
        phrase: "Stratejik bir karar alındı",
        translation: "A strategic decision has been made",
        phonetic: "Stra-te-jeek beer kah-rar ah-lun-duh",
        tip: "Keep the vowel sound in 'karar' balanced, making both 'a' sounds clear and equal."
      }
    }
  ]
};
