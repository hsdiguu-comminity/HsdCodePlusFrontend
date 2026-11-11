// ---- Quiz verileri (GEÇİCİ: backend gelince API'den gelecek) ----
import { POINTS_PER_QUESTION } from "@/lib/results";
import type { Category, Quiz, QuizDetail, QuizQuestion } from "@/types";

// Kısa yazım için yardımcı: bir soru nesnesi üretir
const q = (text: string, options: string[], correctIndex: number, explanation: string): QuizQuestion => ({
  text,
  options,
  correctIndex,
  explanation,
});

// Quiz bilgisi + soruları birleştirir; soru sayısı ve toplam puan otomatik hesaplanır
function build(
  meta: { id: string; title: string; category: Category; durationMin: number; description: string },
  questions: QuizQuestion[],
): QuizDetail {
  return {
    ...meta,
    questionCount: questions.length,
    points: questions.length * POINTS_PER_QUESTION,
    questions,
  };
}

// ---------- 1) HSD testi ----------
const hsd = build(
  {
    id: "hsd",
    title: "HSD'yi Ne Kadar Tanıyorsun?",
    category: "HSD",
    durationMin: 8,
    description: "HSD programı, öğrenci gelişimi ve HSDCode+ hakkında genel bilgiler.",
  },
  [
    q("HSD kısaltmasının açılımı nedir?", ["Huawei Software Design", "Huawei Student Developers", "High System Development", "Human Science Department"], 1, "HSD, Huawei Student Developers anlamına gelir."),
    q("HSD programının temel hedeflerinden biri hangisidir?", ["Öğrencilerin teknoloji alanında gelişmesini desteklemek", "Yalnızca donanım satmak", "Üniversite derslerini kaldırmak", "Sadece deneyimli yazılımcılara hitap etmek"], 0, "Program öğrencilerin teknik ve kişisel gelişimini desteklemeyi amaçlar."),
    q("HSD hangi alanla en yakından ilişkilidir?", ["Tarım makineleri üretimi", "Moda tasarımı", "Teknoloji ve yazılım geliştirme", "Turizm rehberliği"], 2, "HSD teknoloji ve geliştirici ekosistemiyle ilişkilidir."),
    q("Bir öğrenci topluluğunda ekip çalışması neden önemlidir?", ["Bütün görevleri tek kişinin yapması için", "İletişimi ve ortak üretimi desteklemek için", "Bilgi paylaşımını engellemek için", "Projeleri gereksiz yere uzatmak için"], 1, "Ekip çalışması farklı becerilerin bir araya gelmesini sağlar."),
    q("HSD ekosistemindeki teknik gelişim alanlarından biri hangisidir?", ["Makine öğrenmesi", "Yalnızca yemek tarifi yazımı", "Dekorasyon alışverişi", "Seyahat rezervasyonu"], 0, "Makine öğrenmesi teknoloji ve yazılım alanlarından biridir."),
    q("Teknik bir atölyenin öğrencilere sağlayabileceği yarar nedir?", ["Uygulama yapmadan beklemek", "Teknolojilerden uzaklaşmak", "Teorik bilgiyi uygulamayla pekiştirmek", "Kod yazmayı bırakmak"], 2, "Atölyeler bilgiyi uygulamalı olarak öğrenmeye yardımcı olabilir."),
    q("Bir proje çalışması neyi destekler?", ["Problem çözme ve ortak üretim becerilerini", "Takım içi iletişimin kesilmesini", "Kodların hiç test edilmemesini", "Bilgi paylaşımının kaldırılmasını"], 0, "Projeler problem çözme, iletişim ve uygulama deneyimi kazandırabilir."),
    q("HSDCode+ platformunun bu projedeki temel amacı nedir?", ["Sadece bilgisayarı hızlandırmak", "Teknik içerik ve testlerle öğrenmeyi desteklemek", "İşletim sistemi kurmak", "İnternet bağlantısını yönetmek"], 1, "HSDCode+ teknik içerikler ve testlerle öğrenmeyi desteklemeyi hedefler."),
    q("İGÜ HSD Gelişim çalışmalarının temel hedeflerinden biri hangisidir?", ["Öğrencileri projelerden uzak tutmak", "Sadece sınav notlarını listelemek", "Teknoloji alanında öğrenme ve proje üretimini desteklemek", "Yazılım öğrenmeyi yasaklamak"], 2, "Öğrenci odaklı öğrenme ve üretim bu bölümün ana hedeflerindendir."),
    q("Bir öğrenci topluluktan en iyi şekilde nasıl yararlanabilir?", ["Çalışmalara katılıp bilgi paylaşarak", "Hiçbir şey öğrenmeden bekleyerek", "Ekip arkadaşlarıyla iletişim kurmayarak", "Yeni teknolojileri takip etmeyerek"], 0, "Katılım, paylaşım ve uygulama topluluk deneyimini güçlendirebilir."),
  ],
);

// ---------- 2) Yapay zekâ testi ----------
const ai = build(
  {
    id: "ai",
    title: "Yapay Zekâ Testi",
    category: "Yapay Zeka",
    durationMin: 10,
    description: "Yapay zekâ ve makine öğrenmesi hakkında temel yazılım bilgileri.",
  },
  [
    q("Yapay zekâ (AI) genel olarak neyi ifade eder?", ["Bilgisayarların yalnızca dosya saklamasını", "Sistemlerin öğrenme, tahmin veya karar verme gibi görevleri gerçekleştirmesini", "Sadece bilgisayar parçalarını", "Yalnızca internet bağlantısını"], 1, "AI, insan zekâsıyla ilişkilendirilen bazı görevleri yerine getiren sistemleri kapsar."),
    q("Makine öğrenmesi (Machine Learning) nedir?", ["Verilerden örüntüler öğrenen yöntemler geliştirme alanı", "Her programı elle satır satır yazmak", "Bilgisayarı fiziksel olarak tamir etmek", "Yalnızca web sayfası tasarlamak"], 0, "Makine öğrenmesi verilerden örüntü öğrenen algoritmalara odaklanır."),
    q("Bir yapay zekâ modelinin eğitilmesinde veri neden önemlidir?", ["Ekranın rengini belirlemek için", "Klavyeyi çalıştırmak için", "Modelin örüntüler öğrenmesine yardımcı olmak için", "İnterneti her zaman hızlandırmak için"], 2, "Eğitim verileri modelin örüntüler öğrenmesinde önemli rol oynar."),
    q("Denetimli öğrenme (supervised learning) eğitim verisi genellikle ne içerir?", ["Yalnızca boş dosyalar", "Girdi örnekleri ve bunlara ait hedef etiketler", "Sadece resim dosyalarının isimleri", "Hiçbir örnek içermeyen klasör"], 1, "Denetimli öğrenmede örnekler bilinen hedeflerle veya etiketlerle eşleştirilir."),
    q("Bir sınıflandırma modelinin amacı hangisidir?", ["Verileri kategorilere ayırmak", "Sadece dosyaları sıkıştırmak", "Bilgisayarı kapatmak", "Her zaman sayı toplamak"], 0, "Sınıflandırma girdileri belirli sınıflara veya kategorilere atar."),
    q("Aşırı öğrenme (overfitting) ne zaman görülür?", ["Model hiç eğitim görmediğinde her zaman", "Veri dosyası açılmadığında", "Model eğitim verisine fazla uyup yeni verilerde kötü performans gösterdiğinde", "Bilgisayarın ekranı kapandığında"], 2, "Overfitting, modelin eğitim verisine aşırı uyup genelleme yeteneğini kaybetmesidir."),
    q("Doğal Dil İşleme (NLP) hangi alanla özellikle ilgilenir?", ["Yalnızca elektrik devreleriyle", "İnsan dili olan metin ve konuşmayla", "Sadece ekran çözünürlüğüyle", "Yalnızca işlemci sıcaklığıyla"], 1, "NLP insan dilini işleme ve anlamlandırma yöntemlerini kapsar."),
    q("Üretken yapay zekâ (Generative AI) ne yapabilir?", ["Yalnızca bilgisayarı yeniden başlatabilir", "Her zaman hatasız bilgi verebilir", "Yalnızca mevcut dosyaları silebilir", "Metin, görsel veya kod gibi yeni içerikler üretebilir"], 3, "Üretken modeller yeni içerikler oluşturabilir; ancak çıktıları hatalı olabilir."),
    q("Modelin daha önce görmediği verilerdeki performansını ölçmek neden önemlidir?", ["Genelleme yeteneğini değerlendirmek için", "Kod satırlarını çoğaltmak için", "Veri türlerini rastgele değiştirmek için", "Modelin adını belirlemek için"], 0, "Görülmemiş verilerde değerlendirme, modelin genelleme başarısını anlamaya yardımcı olur."),
    q("Yapay zekâ sistemlerinin çıktılarıyla ilgili en doğru yaklaşım hangisidir?", ["Her çıktıyı sorgulamadan doğru kabul etmek", "Test etmeye gerek duymamak", "Sonuçları kontrol etmek ve hataları değerlendirmek", "Veri kalitesini önemsiz saymak"], 2, "Yapay zekâ çıktıları hatalı veya yanlı olabilir; doğrulama önemlidir."),
  ],
);

// ---------- 3) JavaScript testi ----------
const js = build(
  {
    id: "js",
    title: "JavaScript Yazım Kuralları",
    category: "Web",
    durationMin: 10,
    description: "Değişken isimleri, anahtar kelimeler, veri tipleri ve JavaScript sözdizimi.",
  },
  [
    q("JavaScript'te değişken tanımlamak için hangi anahtar kelimeler kullanılabilir?", ["make ve create", "let, const ve var", "string ve number", "define ve value"], 1, "JavaScript'te değişken tanımlamak için let, const ve var kullanılabilir."),
    q("Aşağıdaki değişken isimlerinden hangisi geçerlidir?", ["2isim", "kullanici-adi", "kullaniciAdi", "let"], 2, "kullaniciAdi geçerli bir isimdir. İsimler rakamla başlayamaz; let ise anahtar kelimedir."),
    q("JavaScript büyük ve küçük harfleri birbirinden ayırır mı?", ["Hayır, hiçbir zaman ayırmaz", "Sadece HTML dosyalarında ayırır", "Yalnızca değişkenlerde ayırmaz", "Evet, büyük ve küçük harf duyarlıdır"], 3, "JavaScript case-sensitive bir dildir. isim ve Isim farklı tanımlayıcılardır."),
    q("Hangisi tek satırlık JavaScript yorumudur?", ["// Bu bir yorumdur", "<!-- Bu bir yorumdur -->", "** Bu bir yorumdur", "## Bu bir yorumdur"], 0, "JavaScript'te // tek satırlık yorum başlatır."),
    q("const ile tanımlanan değişken hakkında hangisi doğrudur?", ["Her zaman sayı tutmalıdır", "Tanımlandıktan sonra yeniden başka bir değere atanamaz", "Sadece fonksiyon içinde kullanılabilir", "İsmi mutlaka büyük yazılmalıdır"], 1, "const ile tanımlanan bağ yeniden atanamaz; ancak nesne veya dizi içeriği değişebilir."),
    q("JavaScript'te metin değeri nasıl yazılabilir?", ["Sadece köşeli parantezle", "Yalnızca süslü parantezle", "Tek tırnak, çift tırnak veya backtick ile", "Yalnızca eğik çizgiyle"], 2, "Metinler 'metin', \"metin\" veya `metin` biçiminde yazılabilir."),
    q("Hem türü hem değeri karşılaştıran operatör hangisidir?", ["=", "!=", "==", "==="], 3, "=== katı eşitlik karşılaştırması yapar; tür dönüşümü uygulamaz."),
    q("Hangisi geçerli bir JavaScript fonksiyon tanımıdır?", ["function selam() {}", "function = selam()", "selam function =>", "def selam():"], 0, "function selam() {} geçerli bir fonksiyon bildirimi örneğidir."),
    q("JavaScript'te dizi oluşturmak için hangi sözdizimi kullanılır?", ['let renkler = ("mavi", "yeşil");', 'let renkler = ["mavi", "yeşil"];', 'let renkler = <"mavi", "yeşil">;', 'let renkler = {"mavi", "yeşil"};'], 1, 'Diziler köşeli parantezle oluşturulur: ["mavi", "yeşil"].'),
    q("JavaScript değişken ismi için hangi kural doğrudur?", ["Her zaman rakamla başlamalıdır", "Boşluk içermesi zorunludur", "Harf, alt çizgi (_) veya dolar işareti ($) ile başlayabilir; rakamla başlayamaz", "Mutlaka Türkçe karakter içermelidir"], 2, "Tanımlayıcılar harf, _ veya $ ile başlayabilir; devamında rakam da bulunabilir."),
  ],
);

// Tüm quizler (soruları ile birlikte)
const allQuizzes: QuizDetail[] = [hsd, ai, js];

// Quiz listesi için özet (sorular olmadan)
export const quizList: Quiz[] = allQuizzes.map((x) => ({
  id: x.id,
  title: x.title,
  category: x.category,
  questionCount: x.questionCount,
  durationMin: x.durationMin,
  points: x.points,
}));

// id'ye göre quiz bul (yoksa undefined döner)
export function getQuizById(id: string): QuizDetail | undefined {
  return allQuizzes.find((x) => x.id === id);
}
