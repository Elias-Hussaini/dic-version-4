// ================================================
// دیتابیس حرفه‌ای افعال آلمانی - بیش از 600 فعل
// نسخه 2.0 - با الگوریتم هوشمند صرف
// ================================================

const VerbsDatabase = (function() {
    'use strict';
    
    // ========== 1. دیتابیس افعال بی‌قاعده (Unregelmäßige Verben) - 200 فعل ==========
    const irregularVerbs = {
        // A1 - افعال پایه (50 فعل)
        "sein": { meaning: "بودن", perfect: "gewesen", past: "war", level: "A1", helper: "sein" },
        "haben": { meaning: "داشتن", perfect: "gehabt", past: "hatte", level: "A1", helper: "haben" },
        "werden": { meaning: "شدن/تبدیل شدن", perfect: "geworden", past: "wurde", level: "A1", helper: "sein" },
        "können": { meaning: "توانستن", perfect: "gekonnt", past: "konnte", level: "A1", helper: "haben" },
        "müssen": { meaning: "باید/مجبور بودن", perfect: "gemusst", past: "musste", level: "A1", helper: "haben" },
        "dürfen": { meaning: "اجازه داشتن", perfect: "gedurft", past: "durfte", level: "A1", helper: "haben" },
        "sollen": { meaning: "باید (وظیفه)", perfect: "gesollt", past: "sollte", level: "A1", helper: "haben" },
        "wollen": { meaning: "خواستن", perfect: "gewollt", past: "wollte", level: "A1", helper: "haben" },
        "mögen": { meaning: "دوست داشتن", perfect: "gemocht", past: "mochte", level: "A1", helper: "haben" },
        "gehen": { meaning: "رفتن", perfect: "gegangen", past: "ging", level: "A1", helper: "sein" },
        "kommen": { meaning: "آمدن", perfect: "gekommen", past: "kam", level: "A1", helper: "sein" },
        "sehen": { meaning: "دیدن", perfect: "gesehen", past: "sah", level: "A1", helper: "haben" },
        "essen": { meaning: "خوردن", perfect: "gegessen", past: "aß", level: "A1", helper: "haben" },
        "trinken": { meaning: "نوشیدن", perfect: "getrunken", past: "trank", level: "A1", helper: "haben" },
        "schlafen": { meaning: "خوابیدن", perfect: "geschlafen", past: "schlief", level: "A1", helper: "haben" },
        "fahren": { meaning: "رانندگی کردن/سفر کردن", perfect: "gefahren", past: "fuhr", level: "A1", helper: "sein" },
        "lesen": { meaning: "خواندن", perfect: "gelesen", past: "las", level: "A1", helper: "haben" },
        "sprechen": { meaning: "صحبت کردن", perfect: "gesprochen", past: "sprach", level: "A1", helper: "haben" },
        "treffen": { meaning: "ملاقات کردن", perfect: "getroffen", past: "traf", level: "A1", helper: "haben" },
        "helfen": { meaning: "کمک کردن", perfect: "geholfen", past: "half", level: "A1", helper: "haben" },
        "nehmen": { meaning: "برداشتن", perfect: "genommen", past: "nahm", level: "A1", helper: "haben" },
        "geben": { meaning: "دادن", perfect: "gegeben", past: "gab", level: "A1", helper: "haben" },
        "finden": { meaning: "پیدا کردن", perfect: "gefunden", past: "fand", level: "A1", helper: "haben" },
        "singen": { meaning: "خواندن (آواز)", perfect: "gesungen", past: "sang", level: "A2", helper: "haben" },
        "springen": { meaning: "پریدن", perfect: "gesprungen", past: "sprang", level: "A2", helper: "sein" },
        "schwimmen": { meaning: "شنا کردن", perfect: "geschwommen", past: "schwamm", level: "A2", helper: "sein" },
        "beginnen": { meaning: "شروع کردن", perfect: "begonnen", past: "begann", level: "A2", helper: "haben" },
        "gewinnen": { meaning: "بردن/برنده شدن", perfect: "gewonnen", past: "gewann", level: "A2", helper: "haben" },
        "bieten": { meaning: "ارائه دادن", perfect: "geboten", past: "bot", level: "B1", helper: "haben" },
        "bitten": { meaning: "درخواست کردن", perfect: "gebeten", past: "bat", level: "A2", helper: "haben" },
        "bleiben": { meaning: "ماندن", perfect: "geblieben", past: "blieb", level: "A2", helper: "sein" },
        "braten": { meaning: "سرخ کردن", perfect: "gebraten", past: "briet", level: "B1", helper: "haben" },
        "brechen": { meaning: "شکستن", perfect: "gebrochen", past: "brach", level: "B1", helper: "haben" },
        "brennen": { meaning: "سوختن", perfect: "gebrannt", past: "brannte", level: "B1", helper: "haben" },
        "bringen": { meaning: "آوردن", perfect: "gebracht", past: "brachte", level: "A2", helper: "haben" },
        "denken": { meaning: "فکر کردن", perfect: "gedacht", past: "dachte", level: "A2", helper: "haben" },
        "dreschen": { meaning: "کوبیدن", perfect: "gedroschen", past: "drosch", level: "C1", helper: "haben" },
        "dringen": { meaning: "اصرار کردن", perfect: "gedrungen", past: "drang", level: "B2", helper: "haben" },
        "empfehlen": { meaning: "توصیه کردن", perfect: "empfohlen", past: "empfahl", level: "B1", helper: "haben" },
        "erschrecken": { meaning: "ترسیدن", perfect: "erschrocken", past: "erschrak", level: "B1", helper: "sein" },
        "essen": { meaning: "خوردن", perfect: "gegessen", past: "aß", level: "A1", helper: "haben" },
        "fahren": { meaning: "رانندگی کردن", perfect: "gefahren", past: "fuhr", level: "A1", helper: "sein" },
        "fallen": { meaning: "افتادن", perfect: "gefallen", past: "fiel", level: "A2", helper: "sein" },
        "fangen": { meaning: "گرفتن/صید کردن", perfect: "gefangen", past: "fing", level: "B1", helper: "haben" },
        "fechten": { meaning: "شمشیربازی کردن", perfect: "gefochten", past: "focht", level: "C1", helper: "haben" },
        "finden": { meaning: "پیدا کردن", perfect: "gefunden", past: "fand", level: "A1", helper: "haben" },
        "fliegen": { meaning: "پرواز کردن", perfect: "geflogen", past: "flog", level: "A2", helper: "sein" },
        "fliehen": { meaning: "فرار کردن", perfect: "geflohen", past: "floh", level: "B2", helper: "sein" },
        "fließen": { meaning: "جاری شدن", perfect: "geflossen", past: "floss", level: "B1", helper: "sein" },
        "fressen": { meaning: "خوردن (حیوانات)", perfect: "gefressen", past: "fraß", level: "B1", helper: "haben" },
        "frieren": { meaning: "یخ زدن", perfect: "gefroren", past: "fror", level: "B1", helper: "haben" },
        "gären": { meaning: "تخمیر شدن", perfect: "gegoren", past: "gor", level: "C1", helper: "sein" },
        "geben": { meaning: "دادن", perfect: "gegeben", past: "gab", level: "A1", helper: "haben" },
        "gedeihen": { meaning: "رشد کردن", perfect: "gediehen", past: "gedieh", level: "C1", helper: "sein" },
        "gehen": { meaning: "رفتن", perfect: "gegangen", past: "ging", level: "A1", helper: "sein" },
        "gelingen": { meaning: "موفق شدن", perfect: "gelungen", past: "gelang", level: "B2", helper: "sein" },
        "gelten": { meaning: "معتبر بودن", perfect: "gegolten", past: "galt", level: "B1", helper: "haben" },
        "genesen": { meaning: "بهبود یافتن", perfect: "genesen", past: "genas", level: "C1", helper: "sein" },
        "genießen": { meaning: "لذت بردن", perfect: "genossen", past: "genoss", level: "B1", helper: "haben" },
        "geschehen": { meaning: "اتفاق افتادن", perfect: "geschehen", past: "geschah", level: "B1", helper: "sein" },
        "gewinnen": { meaning: "بردن", perfect: "gewonnen", past: "gewann", level: "A2", helper: "haben" },
        "gießen": { meaning: "ریختن", perfect: "gegossen", past: "goss", level: "B1", helper: "haben" },
        "gleichen": { meaning: "شبیه بودن", perfect: "geglichen", past: "glich", level: "B2", helper: "haben" },
        "gleiten": { meaning: "سر خوردن", perfect: "geglitten", past: "glitt", level: "B2", helper: "sein" },
        "graben": { meaning: "حفر کردن", perfect: "gegraben", past: "grub", level: "B2", helper: "haben" },
        "greifen": { meaning: "گرفتن/چنگ زدن", perfect: "gegriffen", past: "griff", level: "B1", helper: "haben" },
        "halten": { meaning: "نگه داشتن", perfect: "gehalten", past: "hielt", level: "A2", helper: "haben" },
        "hängen": { meaning: "آویزان کردن", perfect: "gehangen", past: "hing", level: "B1", helper: "haben" },
        "hauen": { meaning: "زدن", perfect: "gehauen", past: "hieb", level: "C1", helper: "haben" },
        "heben": { meaning: "بلند کردن", perfect: "gehoben", past: "hob", level: "B1", helper: "haben" },
        "heißen": { meaning: "نام داشتن/معنی دادن", perfect: "geheißen", past: "hieß", level: "A1", helper: "haben" },
        "helfen": { meaning: "کمک کردن", perfect: "geholfen", past: "half", level: "A1", helper: "haben" },
        "kennen": { meaning: "شناختن", perfect: "gekannt", past: "kannte", level: "A2", helper: "haben" },
        "klingen": { meaning: "به صدا درآمدن", perfect: "geklungen", past: "klang", level: "B1", helper: "haben" },
        "kneifen": { meaning: "نیشگون گرفتن", perfect: "gekniffen", past: "kniff", level: "C1", helper: "haben" },
        "kommen": { meaning: "آمدن", perfect: "gekommen", past: "kam", level: "A1", helper: "sein" },
        "können": { meaning: "توانستن", perfect: "gekonnt", past: "konnte", level: "A1", helper: "haben" },
        "kriechen": { meaning: "خزیدن", perfect: "gekrochen", past: "kroch", level: "B2", helper: "sein" },
        "laden": { meaning: "بار کردن", perfect: "geladen", past: "lud", level: "B1", helper: "haben" },
        "lassen": { meaning: "اجازه دادن/باعث شدن", perfect: "gelassen", past: "ließ", level: "A2", helper: "haben" },
        "laufen": { meaning: "دویدن", perfect: "gelaufen", past: "lief", level: "A2", helper: "sein" },
        "leiden": { meaning: "رنج بردن", perfect: "gelitten", past: "litt", level: "B1", helper: "haben" },
        "leihen": { meaning: "قرض دادن", perfect: "geliehen", past: "lieh", level: "B1", helper: "haben" },
        "lesen": { meaning: "خواندن", perfect: "gelesen", past: "las", level: "A1", helper: "haben" },
        "liegen": { meaning: "قرار داشتن", perfect: "gelegen", past: "lag", level: "A2", helper: "haben" },
        "lügen": { meaning: "دروغ گفتن", perfect: "gelogen", past: "log", level: "B1", helper: "haben" },
        "mahlen": { meaning: "آسیاب کردن", perfect: "gemahlen", past: "mahlte", level: "C1", helper: "haben" },
        "meiden": { meaning: "اجتناب کردن", perfect: "gemieden", past: "mied", level: "B2", helper: "haben" },
        "melken": { meaning: "دوشیدن", perfect: "gemolken", past: "molk", level: "C1", helper: "haben" },
        "messen": { meaning: "اندازه گرفتن", perfect: "gemessen", past: "maß", level: "B1", helper: "haben" },
        "misslingen": { meaning: "ناموفق بودن", perfect: "misslungen", past: "misslang", level: "B2", helper: "sein" },
        "mögen": { meaning: "دوست داشتن", perfect: "gemocht", past: "mochte", level: "A1", helper: "haben" },
        "müssen": { meaning: "باید", perfect: "gemusst", past: "musste", level: "A1", helper: "haben" },
        "nehmen": { meaning: "برداشتن", perfect: "genommen", past: "nahm", level: "A1", helper: "haben" },
        "nennen": { meaning: "نام بردن", perfect: "genannt", past: "nannte", level: "B1", helper: "haben" },
        "pfeifen": { meaning: "سوت زدن", perfect: "gepfiffen", past: "pfiff", level: "B2", helper: "haben" },
        "preisen": { meaning: "ستودن", perfect: "gepriesen", past: "pries", level: "C1", helper: "haben" },
        "quellen": { meaning: "جوشیدن", perfect: "gequollen", past: "quoll", level: "C1", helper: "sein" },
        "raten": { meaning: "توصیه کردن/حدس زدن", perfect: "geraten", past: "riet", level: "B1", helper: "haben" },
        "reiben": { meaning: "مالیدن", perfect: "gerieben", past: "rieb", level: "B2", helper: "haben" },
        "reißen": { meaning: "پاره کردن", perfect: "gerissen", past: "riss", level: "B2", helper: "haben" },
        "reiten": { meaning: "سوار شدن", perfect: "geritten", past: "ritt", level: "B1", helper: "sein" },
        "rennen": { meaning: "دویدن", perfect: "gerannt", past: "rannte", level: "A2", helper: "sein" },
        "riechen": { meaning: "بو کردن", perfect: "gerochen", past: "roch", level: "B1", helper: "haben" },
        "ringen": { meaning: "کشتی گرفتن", perfect: "gerungen", past: "rang", level: "C1", helper: "haben" },
        "rinnen": { meaning: "جاری شدن", perfect: "geronnen", past: "ronn", level: "C1", helper: "sein" },
        "rufen": { meaning: "صدا زدن", perfect: "gerufen", past: "rief", level: "A2", helper: "haben" },
        "salzen": { meaning: "نمک زدن", perfect: "gesalzen", past: "salzte", level: "C1", helper: "haben" },
        "saufen": { meaning: "نوشیدن (حیوانات)", perfect: "gesoffen", past: "soff", level: "B1", helper: "haben" },
        "saugen": { meaning: "مکیدن", perfect: "gesogen", past: "sog", level: "B2", helper: "haben" },
        "schaffen": { meaning: "خلق کردن", perfect: "geschaffen", past: "schuf", level: "B2", helper: "haben" },
        "schallen": { meaning: "طنین انداختن", perfect: "geschallt", past: "schallte", level: "C1", helper: "haben" },
        "scheiden": { meaning: "جدا کردن", perfect: "geschieden", past: "schied", level: "C1", helper: "haben" },
        "scheinen": { meaning: "به نظر رسیدن", perfect: "geschienen", past: "schien", level: "B1", helper: "haben" },
        "schieben": { meaning: "هل دادن", perfect: "geschoben", past: "schob", level: "B1", helper: "haben" },
        "schießen": { meaning: "شلیک کردن", perfect: "geschossen", past: "schoss", level: "B1", helper: "haben" },
        "schinden": { meaning: "شکنجه کردن", perfect: "geschunden", past: "schund", level: "C1", helper: "haben" },
        "schlafen": { meaning: "خوابیدن", perfect: "geschlafen", past: "schlief", level: "A1", helper: "haben" },
        "schlagen": { meaning: "زدن", perfect: "geschlagen", past: "schlug", level: "B1", helper: "haben" },
        "schleichen": { meaning: "یواشکی رفتن", perfect: "geschlichen", past: "schlich", level: "B2", helper: "sein" },
        "schleifen": { meaning: "ساییدن", perfect: "geschliffen", past: "schliff", level: "C1", helper: "haben" },
        "schließen": { meaning: "بستن", perfect: "geschlossen", past: "schloss", level: "A2", helper: "haben" },
        "schlingen": { meaning: "پیچیدن", perfect: "geschlungen", past: "schlang", level: "C1", helper: "haben" },
        "schmelzen": { meaning: "ذوب شدن", perfect: "geschmolzen", past: "schmolz", level: "B2", helper: "sein" },
        "schneiden": { meaning: "بریدن", perfect: "geschnitten", past: "schnitt", level: "A2", helper: "haben" },
        "schreiben": { meaning: "نوشتن", perfect: "geschrieben", past: "schrieb", level: "A1", helper: "haben" },
        "schreien": { meaning: "فریاد زدن", perfect: "geschrien", past: "schrie", level: "B1", helper: "haben" },
        "schreiten": { meaning: "گام برداشتن", perfect: "geschritten", past: "schritt", level: "B2", helper: "sein" },
        "schweigen": { meaning: "سکوت کردن", perfect: "geschwiegen", past: "schwieg", level: "B2", helper: "haben" },
        "schwellen": { meaning: "باد کردن", perfect: "geschwollen", past: "schwoll", level: "B2", helper: "sein" },
        "schwimmen": { meaning: "شنا کردن", perfect: "geschwommen", past: "schwamm", level: "A2", helper: "sein" },
        "schwinden": { meaning: "کم شدن", perfect: "geschwunden", past: "schwand", level: "C1", helper: "sein" },
        "schwingen": { meaning: "تکان دادن", perfect: "geschwungen", past: "schwang", level: "C1", helper: "haben" },
        "schwören": { meaning: "قسم خوردن", perfect: "geschworen", past: "schwor", level: "B2", helper: "haben" },
        "sehen": { meaning: "دیدن", perfect: "gesehen", past: "sah", level: "A1", helper: "haben" },
        "sein": { meaning: "بودن", perfect: "gewesen", past: "war", level: "A1", helper: "sein" },
        "senden": { meaning: "فرستادن", perfect: "gesendet", past: "sandte", level: "B1", helper: "haben" },
        "singen": { meaning: "خواندن", perfect: "gesungen", past: "sang", level: "A2", helper: "haben" },
        "sinken": { meaning: "فرو رفتن", perfect: "gesunken", past: "sank", level: "B1", helper: "sein" },
        "sinnen": { meaning: "اندیشیدن", perfect: "gesonnen", past: "sann", level: "C1", helper: "haben" },
        "sitzen": { meaning: "نشستن", perfect: "gesessen", past: "saß", level: "A1", helper: "haben" },
        "sollen": { meaning: "باید", perfect: "gesollt", past: "sollte", level: "A1", helper: "haben" },
        "spalten": { meaning: "شکافتن", perfect: "gespalten", past: "spaltete", level: "C1", helper: "haben" },
        "speien": { meaning: "تف کردن", perfect: "gespien", past: "spie", level: "C1", helper: "haben" },
        "spinnen": { meaning: "ریسیدن", perfect: "gesponnen", past: "spann", level: "C1", helper: "haben" },
        "sprechen": { meaning: "صحبت کردن", perfect: "gesprochen", past: "sprach", level: "A1", helper: "haben" },
        "springen": { meaning: "پریدن", perfect: "gesprungen", past: "sprang", level: "A2", helper: "sein" },
        "stechen": { meaning: "فرو کردن", perfect: "gestochen", past: "stach", level: "B1", helper: "haben" },
        "stehen": { meaning: "ایستادن", perfect: "gestanden", past: "stand", level: "A1", helper: "haben" },
        "stehlen": { meaning: "دزدیدن", perfect: "gestohlen", past: "stahl", level: "B1", helper: "haben" },
        "steigen": { meaning: "بالا رفتن", perfect: "gestiegen", past: "stieg", level: "B1", helper: "sein" },
        "sterben": { meaning: "مردن", perfect: "gestorben", past: "starb", level: "B1", helper: "sein" },
        "stinken": { meaning: "بو دادن", perfect: "gestunken", past: "stank", level: "B2", helper: "haben" },
        "stoßen": { meaning: "زدن/هل دادن", perfect: "gestoßen", past: "stieß", level: "B1", helper: "haben" },
        "streichen": { meaning: "مالیدن/لغو کردن", perfect: "gestrichen", past: "strich", level: "B2", helper: "haben" },
        "streiten": { meaning: "جر و بحث کردن", perfect: "gestritten", past: "stritt", level: "B1", helper: "haben" },
        "tragen": { meaning: "حمل کردن", perfect: "getragen", past: "trug", level: "A2", helper: "haben" },
        "treffen": { meaning: "ملاقات کردن", perfect: "getroffen", past: "traf", level: "A1", helper: "haben" },
        "treiben": { meaning: "هل دادن/انجام دادن", perfect: "getrieben", past: "trieb", level: "B1", helper: "haben" },
        "treten": { meaning: "پا گذاشتن", perfect: "getreten", past: "trat", level: "B1", helper: "sein" },
        "trinken": { meaning: "نوشیدن", perfect: "getrunken", past: "trank", level: "A1", helper: "haben" },
        "tun": { meaning: "انجام دادن", perfect: "getan", past: "tat", level: "A2", helper: "haben" },
        "verbergen": { meaning: "پنهان کردن", perfect: "verborgen", past: "verbarg", level: "B2", helper: "haben" },
        "verderben": { meaning: "خراب کردن", perfect: "verdorben", past: "verdarb", level: "B2", helper: "haben" },
        "verdrießen": { meaning: "ناراحت کردن", perfect: "verdrossen", past: "verdross", level: "C1", helper: "haben" },
        "vergehen": { meaning: "گذشتن", perfect: "vergangen", past: "verging", level: "B2", helper: "sein" },
        "vergessen": { meaning: "فراموش کردن", perfect: "vergessen", past: "vergaß", level: "A2", helper: "haben" },
        "verlieren": { meaning: "گم کردن", perfect: "verloren", past: "verlor", level: "A2", helper: "haben" },
        "wachsen": { meaning: "رشد کردن", perfect: "gewachsen", past: "wuchs", level: "B1", helper: "sein" },
        "waschen": { meaning: "شستن", perfect: "gewaschen", past: "wusch", level: "A2", helper: "haben" },
        "weben": { meaning: "بافتن", perfect: "gewebt", past: "webte", level: "C1", helper: "haben" },
        "weichen": { meaning: "نرم شدن", perfect: "gewichen", past: "wich", level: "C1", helper: "sein" },
        "weisen": { meaning: "نشان دادن", perfect: "gewiesen", past: "wies", level: "B1", helper: "haben" },
        "wenden": { meaning: "برگرداندن", perfect: "gewandt", past: "wandte", level: "B2", helper: "haben" },
        "werben": { meaning: "تبلیغ کردن", perfect: "geworben", past: "warb", level: "B2", helper: "haben" },
        "werden": { meaning: "شدن", perfect: "geworden", past: "wurde", level: "A1", helper: "sein" },
        "werfen": { meaning: "انداختن", perfect: "geworfen", past: "warf", level: "A2", helper: "haben" },
        "wiegen": { meaning: "وزن داشتن", perfect: "gewogen", past: "wog", level: "B1", helper: "haben" },
        "winden": { meaning: "پیچیدن", perfect: "gewunden", past: "wand", level: "C1", helper: "haben" },
        "wissen": { meaning: "دانستن", perfect: "gewusst", past: "wusste", level: "A2", helper: "haben" },
        "wollen": { meaning: "خواستن", perfect: "gewollt", past: "wollte", level: "A1", helper: "haben" },
        "ziehen": { meaning: "کشیدن", perfect: "gezogen", past: "zog", level: "A2", helper: "haben" },
        "zwingen": { meaning: "مجبور کردن", perfect: "gezwungen", past: "zwang", level: "B1", helper: "haben" },
            "aussehen": { meaning: "به نظر رسیدن", perfect: "ausgesehen", past: "sah aus", level: "B1", helper: "haben" },
    "aufstehen": { meaning: "بلند شدن", perfect: "aufgestanden", past: "stand auf", level: "A2", helper: "sein" },
    "anfangen": { meaning: "شروع کردن", perfect: "angefangen", past: "fing an", level: "A2", helper: "haben" },
    "aufhören": { meaning: "متوقف کردن", perfect: "aufgehört", past: "hörte auf", level: "A2", helper: "haben" },
    "mitkommen": { meaning: "همراه آمدن", perfect: "mitgekommen", past: "kam mit", level: "A2", helper: "sein" },
    "stattfinden": { meaning: "اتفاق افتادن", perfect: "stattgefunden", past: "fand statt", level: "B1", helper: "haben" },
    "teilnehmen": { meaning: "شرکت کردن", perfect: "teilgenommen", past: "nahm teil", level: "B1", helper: "haben" },
    "vorstellen": { meaning: "معرفی کردن", perfect: "vorgestellt", past: "stellte vor", level: "A2", helper: "haben" },
    "wiederholen": { meaning: "تکرار کردن", perfect: "wiederholt", past: "wiederholte", level: "A2", helper: "haben" },
    "übersetzen": { meaning: "ترجمه کردن", perfect: "übersetzt", past: "übersetzte", level: "B1", helper: "haben" },
    "verstehen": { meaning: "فهمیدن", perfect: "verstanden", past: "verstand", level: "A2", helper: "haben" },
    "verbessern": { meaning: "بهبود بخشیدن", perfect: "verbessert", past: "verbesserte", level: "B1", helper: "haben" },
    "vergleichen": { meaning: "مقایسه کردن", perfect: "verglichen", past: "verglich", level: "B1", helper: "haben" },
    "verlassen": { meaning: "ترک کردن", perfect: "verlassen", past: "verließ", level: "B1", helper: "haben" },
    "vermeiden": { meaning: "اجتناب کردن", perfect: "vermieden", past: "vermied", level: "B2", helper: "haben" },
    "versprechen": { meaning: "قول دادن", perfect: "versprochen", past: "versprach", level: "B1", helper: "haben" },
    "verstehen": { meaning: "فهمیدن", perfect: "verstanden", past: "verstand", level: "A2", helper: "haben" },
    "vorbereiten": { meaning: "آماده کردن", perfect: "vorbereitet", past: "bereitete vor", level: "B1", helper: "haben" },
    "vorschlagen": { meaning: "پیشنهاد کردن", perfect: "vorgeschlagen", past: "schlug vor", level: "B1", helper: "haben" },
    "wachsen": { meaning: "رشد کردن", perfect: "gewachsen", past: "wuchs", level: "B1", helper: "sein" },
    "waschen": { meaning: "شستن", perfect: "gewaschen", past: "wusch", level: "A2", helper: "haben" },
    "weggehen": { meaning: "رفتن (از جایی)", perfect: "weggegangen", past: "ging weg", level: "A2", helper: "sein" },
    "weglaufen": { meaning: "فرار کردن", perfect: "weggelaufen", past: "lief weg", level: "B1", helper: "sein" },
    "weitermachen": { meaning: "ادامه دادن", perfect: "weitergemacht", past: "machte weiter", level: "A2", helper: "haben" },
    "wiederfinden": { meaning: "دوباره پیدا کردن", perfect: "wiedergefunden", past: "fand wieder", level: "B2", helper: "haben" },
    "wiedersehen": { meaning: "دوباره دیدن", perfect: "wiedergesehen", past: "sah wieder", level: "A2", helper: "haben" },
    "zunehmen": { meaning: "افزایش یافتن", perfect: "zugenommen", past: "nahm zu", level: "B1", helper: "haben" },
    "zurückkommen": { meaning: "بازگشتن", perfect: "zurückgekommen", past: "kam zurück", level: "A2", helper: "sein" },
    "zusammenarbeiten": { meaning: "همکاری کردن", perfect: "zusammengearbeitet", past: "arbeitete zusammen", level: "B1", helper: "haben" },
    "zuschauen": { meaning: "تماشا کردن", perfect: "zugeschaut", past: "schaute zu", level: "A2", helper: "haben" },
    // ========== افعال بی‌قاعده جدید - سطح B2/C1 ==========
"abarbeiten": { meaning: "کار را تمام کردن", perfect: "abgearbeitet", past: "arbeitete ab", level: "B2", helper: "haben" },
"abbeißen": { meaning: "گاز گرفتن و جدا کردن", perfect: "abgebissen", past: "biss ab", level: "B2", helper: "haben" },
"abbekommen": { meaning: "به دست آوردن", perfect: "abbekommen", past: "bekam ab", level: "C1", helper: "haben" },
"abberufen": { meaning: "فراخواندن", perfect: "abberufen", past: "berief ab", level: "C1", helper: "haben" },
"abbiegen": { meaning: "چرخیدن", perfect: "abgebogen", past: "bog ab", level: "B2", helper: "sein" },
"abblasen": { meaning: "لغو کردن", perfect: "abgeblasen", past: "blies ab", level: "C1", helper: "haben" },
"abblättern": { meaning: "پوست انداختن", perfect: "abgeblättert", past: "blätterte ab", level: "C1", helper: "sein" },
"abbrechen": { meaning: "قطع کردن", perfect: "abgebrochen", past: "brach ab", level: "B2", helper: "haben" },
"abbrennen": { meaning: "سوزاندن", perfect: "abgebrannt", past: "brannte ab", level: "B2", helper: "haben" },
"abdingen": { meaning: "چانه زدن", perfect: "abgedungen", past: "dingte ab", level: "C1", helper: "haben" },
"abdrehen": { meaning: "بستن (شیر)", perfect: "abgedreht", past: "drehte ab", level: "B2", helper: "haben" },
"abdringen": { meaning: "گرفتن با زور", perfect: "abgedrungen", past: "drang ab", level: "C1", helper: "haben" },
"abfahren": { meaning: "حرکت کردن", perfect: "abgefahren", past: "fuhr ab", level: "B1", helper: "sein" },
"abfallen": { meaning: "افتادن", perfect: "abgefallen", past: "fiel ab", level: "B2", helper: "sein" },
"abfangen": { meaning: "گرفتن", perfect: "abgefangen", past: "fing ab", level: "B2", helper: "haben" },
"abfechten": { meaning: "تمام کردن مبارزه", perfect: "abgefochten", past: "focht ab", level: "C1", helper: "haben" },
"abfinden": { meaning: "سازش کردن", perfect: "abgefunden", past: "fand ab", level: "C1", helper: "haben" },
"abfliegen": { meaning: "پرواز کردن", perfect: "abgeflogen", past: "flog ab", level: "B2", helper: "sein" },
"abfließen": { meaning: "جاری شدن", perfect: "abgeflossen", past: "floss ab", level: "C1", helper: "sein" },
"abfressen": { meaning: "خوردن (حیوان)", perfect: "abgefressen", past: "fraß ab", level: "C1", helper: "haben" },
"abfrieren": { meaning: "یخ زدن", perfect: "abgefroren", past: "fror ab", level: "C1", helper: "sein" },
"abgeben": { meaning: "تحویل دادن", perfect: "abgegeben", past: "gab ab", level: "B1", helper: "haben" },
"abgehen": { meaning: "جدا شدن", perfect: "abgegangen", past: "ging ab", level: "B2", helper: "sein" },
"abgelten": { meaning: "جبران کردن", perfect: "abgegolten", past: "galt ab", level: "C1", helper: "haben" },
"abgewöhnen": { meaning: "ترک عادت", perfect: "abgewöhnt", past: "gewöhnte ab", level: "B2", helper: "haben" },
"abgießen": { meaning: "ریختن آب", perfect: "abgegossen", past: "goss ab", level: "C1", helper: "haben" },
"abgleichen": { meaning: "مقایسه کردن", perfect: "abgeglichen", past: "glich ab", level: "C1", helper: "haben" },
"abgleiten": { meaning: "سر خوردن", perfect: "abgeglitten", past: "glitt ab", level: "C1", helper: "sein" },
"abgraben": { meaning: "حفر کردن", perfect: "abgegraben", past: "grub ab", level: "C1", helper: "haben" },
"abgrenzen": { meaning: "مرزبندی کردن", perfect: "abgegrenzt", past: "grenzte ab", level: "B2", helper: "haben" },
"abhalten": { meaning: "بازداشتن", perfect: "abgehalten", past: "hielt ab", level: "B2", helper: "haben" },
"abhängen": { meaning: "آویزان بودن", perfect: "abgehangen", past: "hing ab", level: "B2", helper: "haben" },
"abheben": { meaning: "برداشتن", perfect: "abgehoben", past: "hob ab", level: "B2", helper: "haben" },
"abhelfen": { meaning: "کمک کردن", perfect: "abgeholfen", past: "half ab", level: "B2", helper: "haben" },
"abholzen": { meaning: "جنگل زدایی", perfect: "abgeholzt", past: "holzte ab", level: "C1", helper: "haben" },
"abkaufen": { meaning: "خریدن", perfect: "abgekauft", past: "kaufte ab", level: "B2", helper: "haben" },
"abklingen": { meaning: "کم شدن", perfect: "abgeklungen", past: "klang ab", level: "C1", helper: "sein" },
"abkommen": { meaning: "منحرف شدن", perfect: "abgekommen", past: "kam ab", level: "B2", helper: "sein" },
"abkühlen": { meaning: "خنک کردن", perfect: "abgekühlt", past: "kühlte ab", level: "B2", helper: "haben" },
"abladen": { meaning: "بار کردن", perfect: "abgeladen", past: "lud ab", level: "B2", helper: "haben" },
"ablassen": { meaning: "رها کردن", perfect: "abgelassen", past: "ließ ab", level: "B2", helper: "haben" },
"ablaufen": { meaning: "تمام شدن", perfect: "abgelaufen", past: "lief ab", level: "B2", helper: "sein" },
"ableben": { meaning: "فوت کردن", perfect: "abelebt", past: "lebte ab", level: "C1", helper: "sein" },
"ablegen": { meaning: "کنار گذاشتن", perfect: "abgelegt", past: "legte ab", level: "B2", helper: "haben" },
"ablehnen": { meaning: "رد کردن", perfect: "abgelehnt", past: "lehnte ab", level: "B1", helper: "haben" },
"ableiten": { meaning: "مشتق گرفتن", perfect: "abgeleitet", past: "leitete ab", level: "B2", helper: "haben" },
"ablenken": { meaning: "منحرف کردن", perfect: "abgelenkt", past: "lenkte ab", level: "B2", helper: "haben" },
"ablesen": { meaning: "خواندن", perfect: "abgelesen", past: "las ab", level: "B2", helper: "haben" },
"abliefern": { meaning: "تحویل دادن", perfect: "abgeliefert", past: "lieferte ab", level: "B2", helper: "haben" },
"abmachen": { meaning: "توافق کردن", perfect: "abgemacht", past: "machte ab", level: "B1", helper: "haben" },
"abmessen": { meaning: "اندازه گرفتن", perfect: "abgemessen", past: "maß ab", level: "B2", helper: "haben" },
"abnehmen": { meaning: "کم کردن", perfect: "abgenommen", past: "nahm ab", level: "B1", helper: "haben" },
"abraten": { meaning: "نهی کردن", perfect: "abgeraten", past: "riet ab", level: "B2", helper: "haben" },
"abreiben": { meaning: "مالیدن", perfect: "abgerieben", past: "rieb ab", level: "C1", helper: "haben" },
"abreißen": { meaning: "پاره کردن", perfect: "abgerissen", past: "riss ab", level: "B2", helper: "haben" },
"abreisen": { meaning: "سفر کردن", perfect: "abgereist", past: "reiste ab", level: "A2", helper: "sein" },
"abringen": { meaning: "با زور گرفتن", perfect: "abgerungen", past: "rang ab", level: "C1", helper: "haben" },
"abrufen": { meaning: "فراخواندن", perfect: "abgerufen", past: "rief ab", level: "B2", helper: "haben" },
"abrücken": { meaning: "عقب کشیدن", perfect: "abgerückt", past: "rückte ab", level: "C1", helper: "haben" },
"absagen": { meaning: "لغو کردن", perfect: "abgesagt", past: "sagte ab", level: "B1", helper: "haben" },
"absaufen": { meaning: "غرق شدن", perfect: "abgesoffen", past: "soff ab", level: "C1", helper: "sein" },
"abschaffen": { meaning: "لغو کردن", perfect: "abgeschafft", past: "schaffte ab", level: "B2", helper: "haben" },
"abscheiden": { meaning: "جدا کردن", perfect: "abgeschieden", past: "schied ab", level: "C1", helper: "haben" },
"abscheren": { meaning: "قیچی کردن", perfect: "abgeschoren", past: "schor ab", level: "C1", helper: "haben" },
"abschieben": { meaning: "تبعید کردن", perfect: "abgeschoben", past: "schob ab", level: "B2", helper: "haben" },
"abschießen": { meaning: "شلیک کردن", perfect: "abgeschossen", past: "schoss ab", level: "B2", helper: "haben" },
"abschlagen": { meaning: "رد کردن", perfect: "abgeschlagen", past: "schlug ab", level: "B2", helper: "haben" },
"abschleifen": { meaning: "سابیدن", perfect: "abgeschliffen", past: "schliff ab", level: "C1", helper: "haben" },
"abschließen": { meaning: "قفل کردن", perfect: "abgeschlossen", past: "schloss ab", level: "B1", helper: "haben" },
"abschmelzen": { meaning: "ذوب کردن", perfect: "abgeschmolzen", past: "schmolz ab", level: "C1", helper: "haben" },
"abschneiden": { meaning: "بریدن", perfect: "abgeschnitten", past: "schnitt ab", level: "B1", helper: "haben" },
"abschreiben": { meaning: "کپی کردن", perfect: "abgeschrieben", past: "schrieb ab", level: "B2", helper: "haben" },
"abschrecken": { meaning: "ترساندن", perfect: "abgeschreckt", past: "schreckte ab", level: "B2", helper: "haben" },
"abschreiten": { meaning: "راه رفتن", perfect: "abgeschritten", past: "schritt ab", level: "C1", helper: "haben" },
"abschwächen": { meaning: "ضعیف کردن", perfect: "abgeschwächt", past: "schwächte ab", level: "B2", helper: "haben" },
"abschweifen": { meaning: "منحرف شدن", perfect: "abgeschweift", past: "schweifte ab", level: "C1", helper: "sein" },
"abschwellen": { meaning: "کم شدن ورم", perfect: "abgeschwollen", past: "schwoll ab", level: "C1", helper: "sein" },
"absehen": { meaning: "پیش بینی کردن", perfect: "abgesehen", past: "sah ab", level: "B2", helper: "haben" },
"absenden": { meaning: "فرستادن", perfect: "abgesendet", past: "sandte ab", level: "B2", helper: "haben" },
"absetzen": { meaning: "نشاندن", perfect: "abgesetzt", past: "setzte ab", level: "B2", helper: "haben" },
"absinken": { meaning: "فرو رفتن", perfect: "abgesunken", past: "sank ab", level: "C1", helper: "sein" },
"absitzen": { meaning: "نشستن", perfect: "abgesessen", past: "saß ab", level: "C1", helper: "haben" },
"absondern": { meaning: "جدا کردن", perfect: "abgesondert", past: "sonderte ab", level: "C1", helper: "haben" },
"abspalten": { meaning: "شکافتن", perfect: "abgespalten", past: "spaltete ab", level: "C1", helper: "haben" },
"abspielen": { meaning: "پخش کردن", perfect: "abgespielt", past: "spielte ab", level: "B1", helper: "haben" },
"absprechen": { meaning: "قرار گذاشتن", perfect: "abgesprochen", past: "sprach ab", level: "B2", helper: "haben" },
"abspringen": { meaning: "پریدن", perfect: "abgesprungen", past: "sprang ab", level: "B2", helper: "sein" },
"abstammen": { meaning: "منشا گرفتن", perfect: "abgestammt", past: "stammte ab", level: "B2", helper: "haben" },
"abstechen": { meaning: "متفاوت بودن", perfect: "abgestochen", past: "stach ab", level: "C1", helper: "haben" },
"abstehen": { meaning: "فاصله داشتن", perfect: "abgestanden", past: "stand ab", level: "C1", helper: "haben" },
"absteigen": { meaning: "پیاده شدن", perfect: "abgestiegen", past: "stieg ab", level: "B2", helper: "sein" },
"abstellen": { meaning: "قرار دادن", perfect: "abgestellt", past: "stellte ab", level: "B2", helper: "haben" },
"absterben": { meaning: "مردن", perfect: "abgestorben", past: "starb ab", level: "B2", helper: "sein" },
"abstimmen": { meaning: "رای دادن", perfect: "abgestimmt", past: "stimmte ab", level: "B1", helper: "haben" },
"abstoßen": { meaning: "دفع کردن", perfect: "abgestoßen", past: "stieß ab", level: "B2", helper: "haben" },
"abstreichen": { meaning: "مالیدن", perfect: "abgestrichen", past: "strich ab", level: "C1", helper: "haben" },
"abstreiten": { meaning: "انکار کردن", perfect: "abgestritten", past: "stritt ab", level: "C1", helper: "haben" },
"absuchen": { meaning: "جستجو کردن", perfect: "abgesucht", past: "suchte ab", level: "B2", helper: "haben" },
"abtragen": { meaning: "از بین بردن", perfect: "abgetragen", past: "trug ab", level: "B2", helper: "haben" },
"abtreiben": { meaning: "سقط کردن", perfect: "abgetrieben", past: "trieb ab", level: "C1", helper: "haben" },
"abtreten": { meaning: "کنار رفتن", perfect: "abgetreten", past: "trat ab", level: "C1", helper: "sein" },
"abtun": { meaning: "نادیده گرفتن", perfect: "abgetan", past: "tat ab", level: "C1", helper: "haben" },
"abwägen": { meaning: "سنجیدن", perfect: "abgewogen", past: "wog ab", level: "C1", helper: "haben" },
"abwaschen": { meaning: "شستن", perfect: "abgewaschen", past: "wusch ab", level: "B2", helper: "haben" },
"abwehren": { meaning: "دفاع کردن", perfect: "abgewehrt", past: "wehrte ab", level: "B2", helper: "haben" },
"abweichen": { meaning: "انحراف داشتن", perfect: "abgewichen", past: "wich ab", level: "C1", helper: "sein" },
"abweisen": { meaning: "رد کردن", perfect: "abgewiesen", past: "wies ab", level: "B2", helper: "haben" },
"abwerben": { meaning: "جذب کردن", perfect: "abgeworben", past: "warb ab", level: "C1", helper: "haben" },
"abwerfen": { meaning: "انداختن", perfect: "abgeworfen", past: "warf ab", level: "B2", helper: "haben" },
"abwiegen": { meaning: "وزن کردن", perfect: "abgewogen", past: "wog ab", level: "C1", helper: "haben" },
"abwischen": { meaning: "پاک کردن", perfect: "abgewischt", past: "wischte ab", level: "B2", helper: "haben" },
"abzahlen": { meaning: "پرداخت کردن", perfect: "abgezahlt", past: "zahlte ab", level: "B2", helper: "haben" },
"abzapfen": { meaning: "کشیدن", perfect: "abgezapft", past: "zapfte ab", level: "C1", helper: "haben" },
"abzeichnen": { meaning: "نشان دادن", perfect: "abgezeichnet", past: "zeichnete ab", level: "B2", helper: "haben" },
"abziehen": { meaning: "کم کردن", perfect: "abgezogen", past: "zog ab", level: "B2", helper: "haben" },
"abzocken": { meaning: "کلاه برداشتن", perfect: "abgezockt", past: "zockte ab", level: "C1", helper: "haben" },
"abzweigen": { meaning: "منحرف کردن", perfect: "abgezweigt", past: "zweigte ab", level: "C1", helper: "haben" }
};

        
   
    
    // ========== 2. الگوهای صرف برای افعال با قاعده ==========
    const regularPatterns = {
        "en": { // افعال معمولی که به -en ختم می‌شوند
            present: (verb) => verb.slice(0, -2) + "e",
            past: (verb) => verb.slice(0, -2) + "te",
            perfect: (verb) => "ge" + verb.slice(0, -2) + "t"
        },
        "eln": { // افعالی که به -eln ختم می‌شوند (مثل lächeln)
            present: (verb) => verb.slice(0, -3) + "le",
            past: (verb) => verb.slice(0, -3) + "elte",
            perfect: (verb) => "ge" + verb.slice(0, -3) + "elt"
        },
        "ern": { // افعالی که به -ern ختم می‌شوند (مثل wandern)
            present: (verb) => verb.slice(0, -3) + "re",
            past: (verb) => verb.slice(0, -3) + "erte",
            perfect: (verb) => "ge" + verb.slice(0, -3) + "ert"
        },
        "ieren": { // افعالی که به -ieren ختم می‌شوند (مثل studieren) - بدون "ge" در گذشته
            present: (verb) => verb.slice(0, -5) + "iere",
            past: (verb) => verb.slice(0, -5) + "ierte",
            perfect: (verb) => verb.slice(0, -5) + "iert"
        }
    };
    
    // ========== 3. لیست افعال با قاعده (400+ فعل) ==========
    const regularVerbsList = [
        
        "lernen", "arbeiten", "wohnen", "heißen", "kaufen", "verkaufen", "zahlen", "bezahlen",
        "reisen", "besuchen", "machen", "sagen", "fragen", "antworten", "glauben", "hoffen",
        "lieben", "hassen", "brauchen", "benutzen", "öffnen", "schließen", "stellen", "legen",
        "setzen", "stellen", "zeigen", "erklären", "wiederholen", "übersetzen", "studieren",
        "trainieren", "telefonieren", "fotografieren", "reparieren", "renovieren", "organisieren",
        "planen", "diskutieren", "informieren", "präsentieren", "reservieren", "passieren",
        
      
        "akzeptieren", "anrufen", "anziehen", "aufräumen", "aufstehen", "ausziehen", "backen",
        "bauen", "bedeuten", "begleiten", "begrüßen", "behandeln", "beobachten", "bereiten",
        "beschreiben", "besitzen", "bestellen", "bestimmen", "besuchen", "bewegen", "bewerben",
        "bezahlen", "bitten", "bleiben", "brauchen", "bringen", "buchen", "danken", "denken",
        "diskutieren", "drucken", "dürfen", "einladen", "empfangen", "empfehlen", "enden",
        "entdecken", "entfernen", "entscheiden", "entschuldigen", "entwickeln", "erfinden",
        "erhalten", "erinnern", "erkennen", "erklären", "erlauben", "erleben", "ernähren",
        "erreichen", "erscheinen", "erwarten", "erzählen", "essen", "fahren", "fallen", "fangen",
        
       
        "abschließen", "anbieten", "anfangen", "ankommen", "anmelden", "ansehen", "antworten",
        "anwenden", "anziehen", "aufgeben", "aufhalten", "auflösen", "aufnehmen", "aufpassen",
        "aufräumen", "aufschreiben", "aufstehen", "auftreten", "aufwachen", "ausbilden",
        "ausdrücken", "ausführen", "ausgeben", "aushalten", "aushelfen", "auskommen",
        "ausleihen", "ausmachen", "ausruhen", "aussagen", "ausschalten", "aussehen", "außen",
        "basteln", "bauen", "bedanken", "bedeuten", "bedienen", "beeilen", "beeinflussen",
        "befinden", "befolgen", "befragen", "begannen", "begeben", "begegnen", "beginnen",
        "begleiten", "begrenzen", "begründen", "behalten", "behandeln", "beherrschen",
        "behuten", "beirren", "beispielen", "beitragen", "bekämpfen", "bekannt", "bekommen",
        "belasten", "beleben", "belegen", "belohnen", "bemerken", "benennen", "benutzen",
        "beobachten", "beraten", "berechnen", "bereiten", "berichten", "berücksichtigen",
        "beruhigen", "berufen", "berühren", "beschäftigen", "bescheiden", "beschließen",
        "beschreiben", "beschuldigen", "beschützen", "beseitigen", "besetzen", "besichtigen",
        "besitzen", "besorgen", "bestehen", "bestellen", "bestimmen", "bestrafen", "besuchen",
        "betanken", "betonen", "betrachten", "betragen", "betreffen", "betreiben", "betreten",
        "beurteilen", "bevölkern", "bevorzugen", "bewachen", "bewältigen", "bewegen",
        "beweisen", "bewerben", "bewerten", "bewilligen", "bewirken", "bewohnen", "bezahlen",
        "bezeichnen", "bezeigen", "beziehen", "bezwecken", "bilden", "bleiben", "blicken",
        "brauchen", "bringen", "buchen", "dämpfen", "danken", "decken", "denken", "deuten",
        "dienen", "drehen", "drucken", "drücken", "dürfen", "ebnen", "ehren", "eichen",
        "eignen", "eilen", "einatmen", "einbrechen", "eindringen", "einführen", "eingehen",
        "einhalten", "einladen", "einlegen", "einrichten", "einschalten", "einschätzen",
        "einsehen", "einsetzen", "einstellen", "einteilen", "einverstanden", "einwandern",
        "einwerfen", "einziehen", "empfangen", "empfehlen", "empfinden", "enden", "entdecken",
      
        "abbrechen", "abfahren", "abgeben", "abheben", "abholen", "abkommen", "abkürzen",
        "ablegen", "ablehnen", "abliefern", "abnehmen", "abonnieren", "abreisen", "abschaffen",
        "abschließen", "abschreiben", "absenken", "abstellen", "abstimmen", "abstoßen",
        "absuchen", "abteilen", "abwarten", "abwerten", "abwickeln", "abziehen", "ändern",
        "anerkennen", "anfangen", "anführen", "angreifen", "anhalten", "anklagen", "ankommen",
        "ankreuzen", "anlegen", "anleiten", "anmelden", "anpassen", "anregen", "anreichen",
        "anrufen", "anschaffen", "anschalten", "anschauen", "ansehen", "ansprechen",
        "anstecken", "anstellen", "anstiften", "anstreben", "anstrengen", "antreffen",
        "antreiben", "antworten", "anvertrauen", "anwenden", "anwerben", "anziehen",
        "arbeiten", "aufarbeiten", "aufbauen", "aufbewahren", "aufbrechen", "aufdecken",
        "aufdrängen", "aufeinander", "auferlegen", "auffallen", "auffangen", "auffassen",
        "auffordern", "aufführen", "aufgeben", "aufgreifen", "aufhalten", "aufhängen",
        "aufheben", "aufklären", "aufkommen", "aufladen", "auflaufen", "auflösen",
        "aufmachen", "aufnehmen", "aufpassen", "aufräumen", "aufregen", "aufrufen",
        "aufsagen", "aufsammeln", "aufschieben", "aufschlagen", "aufschließen", "aufschreiben",
        "aufsehen", "aufsetzen", "aufstehen", "aufstocken", "auftauchen", "auftragen",
        "auftreffen", "auftreten", "aufwachen", "aufwerten", "aufziehen", "ausarbeiten",
        "ausatmen", "ausbauen", "ausbeuten", "ausbilden", "ausbreiten", "ausdehnen",
        "ausdenken", "ausdrücken", "auseinander", "ausfahren", "ausfallen", "ausführen",
        "ausgeben", "ausgehen", "ausgleichen", "ausgraben", "aushalten", "ausheben",
     "bearbeiten", "beaufsichtigen", "bedanken", "bedecken", "bedienen", "bedrohen", "beeilen",
    "beeindrucken", "beeinflussen", "befallen", "befassen", "befehlen", "befestigen", "befinden",
    "befolgen", "befragen", "befreien", "befriedigen", "befürchten", "begannen", "begeben",
    "begegnen", "begehen", "begeistern", "beginnen", "begleiten", "begrenzen", "begründen",
    "begrüßen", "behalten", "behandeln", "behaupten", "beherbergen", "beherrschen", "behuten",
    "beirren", "beißen", "beitragen", "bekämpfen", "bekannt", "bekennen", "beklagen", "bekommen",
    "belasten", "beleben", "belegen", "belehren", "beleidigen", "belohnen", "belügen", "bemalen",
    "bemerkbar", "bemerken", "bemühen", "benachrichtigen", "benennen", "benutzen", "beobachten",
    "beraten", "berechnen", "bereichern", "bereisen", "bereiten", "berichten", "berücksichtigen",
    "beruhigen", "berufen", "berühren", "beschaffen", "beschäftigen", "bescheiden", "beschimpfen",
    "beschließen", "beschreiben", "beschuldigen", "beschützen", "beseitigen", "besetzen",
    "besichtigen", "besiedeln", "besitzen", "besorgen", "besprechen", "bestehen", "bestellen",
    "bestimmen", "bestrafen", "bestreiten", "besuchen", "betanken", "betasten", "beteiligen",
    "beten", "betonen", "betrachten", "betragen", "betreffen", "betreiben", "betreten", "betrügen",
    "beurteilen", "bevölkern", "bevorzugen", "bewachen", "bewältigen", "bewegen", "beweisen",
    "bewerben", "bewerten", "bewilligen", "bewirken", "bewohnen", "bezahlen", "bezeichnen",
    "bezeigen", "beziehen", "bezwecken", "biegen", "bieten", "binden", "bitten", "bleiben",
    
   
    "durcharbeiten", "durchblicken", "durchbrechen", "durchdrehen", "durchführen", "durchhalten",
    "durchkommen", "durchkreuzen", "durchlaufen", "durchlesen", "durchmachen", "durchqueren",
    "durchschauen", "durchschneiden", "durchschreiben", "durchsetzen", "durchsuchen", "durchziehen",
    "einatmen", "einbrechen", "eindringen", "einführen", "eingehen", "einhalten", "einladen",
    "einlegen", "einrichten", "einschalten", "einschätzen", "einsehen", "einsetzen", "einstellen",
    "einteilen", "einverstanden", "einwandern", "einwerfen", "einziehen", "empfangen", "empfehlen",
    "empfinden", "enden", "entdecken", "entfernen", "entgehen", "enthalten", "entkommen",
    "entlassen", "entlasten", "entleihen", "entlohnen", "entnehmen", "entraten", "entreissen",
    "entrichten", "entrüsten", "entsagen", "entscheiden", "entschädigen", "entschlafen",
    "entschließen", "entschuldigen", "entsetzen", "entsichern", "entsorgen", "entspannen",
    "entsprechen", "entstehen", "entstellen", "enttäuschen", "entwaffnen", "entwerten",
    "entwickeln", "entwirren", "entwöhnen", "entzaubern", "entziehen", "entzücken", "entzünden",
    "erarbeiten", "erbauen", "erbeben", "erben", "erbieten", "erblassen", "erblicken", "erbrechen",
    "erbringen", "erdenken", "erdrosseln", "erdulden", "erfahren", "erfassen", "erfinden",
    "erflehen", "erfolgen", "erforschen", "erfreuen", "erfrieren", "erfüllen", "ergänzen",
    "ergeben", "erglühen", "ergreifen", "erhalten", "erheben", "erhitzen", "erhöhen", "erholen",
    "erinnern", "erkalten", "erkämpfen", "erkennen", "erklären", "erklimmen", "erkranken",
    "erlauben", "erleben", "erledigen", "erlegen", "erlernen", "erleuchten", "erlösen", "ermächtigen",
    "ermahnen", "ermangeln", "ermäßigen", "ermatten", "ermessen", "ermitteln", "ermöglichen",
    "ermorden", "ermüden", "ernähren", "ernennen", "erneuern", "erniedrigen", "ernst", "ernten",
    "eröffnen", "erörtern", "erpressen", "erproben", "errechnen", "erregen", "erreichen",
    "errichten", "erringen", "erröten", "ersaufen", "erschaffen", "erschaﬀen", "erscheinen",
    "erschießen", "erschlagen", "schließen", "erschöpfen", "erschrecken", "erschweren", "ersetzen",
    "ersinnen", "ersparen", "erstatten", "erstecken", "erstellen", "ersterben", "ersticken",
    "erstürmen", "ersuchen", "ertappen", "ertasten", "erteilen", "ertragen", "ertränken", "ertreten",
    "ertrotzen", "ertüfteln", "eruieren", "erwachen", "erwachsen", "erwagen", "erwähnen",
    "erwärmen", "erwarten", "erweisen", "erweitern", "erwerben", "erwidern", "erwürgen", "erzählen",
    "erzeugen", "erziehen", "erzielen", "erzittern", "erzwingen", "erzürnen",
    // ========== افعال با قاعده جدید - سطح A2-B2 ==========
"abonnieren", "abschätzen", "abschirmen", "abschleppen", "abschminken", "abschnallen", 
"abschrauben", "abschrecken", "abschreiben", "abschrubben", "abschütteln", "abseilen",
"absichern", "absolvieren", "absorbieren", "abspielen", "abspreizen", "abspringen",
"abstempeln", "abstimmen", "abstoppen", "abstrahlen", "abstreifen", "abstufen",
"absuchen", "abtanzen", "abteilen", "abtippen", "abtransportieren", "abtrennen",
"abtrocknen", "abtrotzen", "abwarten", "abwracken", "abzählen", "abzapfen",
"adaptieren", "addieren", "adressieren", "affirmieren", "agieren", "aktivieren",
"aktualisieren", "alphabetisieren", "altern", "amnestieren", "amputieren", "analysieren",
"anbauen", "anberaumen", "anbeten", "anbiedern", "anbinden", "anblasen", "anblicken",
"anbraten", "anbrechen", "anbringen", "andauern", "andeuten", "andienen", "andocken",
"aneignen", "anekeln", "anerkennen", "anfachen", "anfassen", "anfeinden", "anfeuchten",
"anfliegen", "anflößen", "anfordern", "anfragen", "anfreunden", "anfügen", "anführen",
"angaben", "angeben", "angehören", "angeln", "angießen", "angreifen", "angrenzen",
"angurten", "anhaben", "anhaken", "anhalten", "anhängen", "anhäufen", "anheben",
"anheften", "anheizen", "ankämpfen", "ankaufen", "anklagen", "ankleben", "anklicken",
"anknüpfen", "ankommen", "ankreuzen", "anlächeln", "anlachen", "anlagern", "anlangen",
"anlassen", "anlasten", "anlaufen", "anläuten", "anlegen", "anlehnen", "anleiten",
"anlernen", "anlesen", "anliefern", "anliegen", "anlügen", "anmachen", "anmailen",
"anmalen", "anmarschieren", "anmelden", "anmerken", "anmessen", "anmieten", "anmustern",
"annähen", "annähern", "annageln", "annähern", "annehmen", "annieten", "annullieren",
"anordnen", "anpacken", "anpassen", "anpflanzen", "anpflocken", "anpingen", "anpreisen",
"anprobieren", "anquatschen", "anradeln", "anranden", "anraten", "anrechnen", "anreden",
"anregen", "anreichen", "anreichern", "anreihen", "anreisen", "anrichten", "anriegeln",
"anrufen", "ansagen", "ansammeln", "ansaugen", "anschaffen", "anschalten", "anschauen",
"anschließen", "anschrauben", "anschreiben", "anschreien", "ansehen", "ansetzen",
"ansiedeln", "anspannen", "ansparen", "ansprechen", "anstacheln", "anstarren",
"anstecken", "anstellen", "anstiften", "anstreben", "anstreichen", "anstrengen",
"anströmen", "anstücken", "anstürmen", "antasten", "antelefonieren", "antesten",
"antragen", "antrauen", "antreffen", "antreiben", "antreten", "antun", "antworten",
"anvertrauen", "anwachsen", "anwalzen", "anwandeln", "anwärmen", "anweisen", "anwenden",
"anwerben", "anwidern", "anwiegen", "anwohnen", "anzahlen", "anzapfen", "anzäunen",
"anzechen", "anzetteln", "anzeigen", "anzielen", "anzocken", "anzünden", "anzweifeln"
];
// ================================================
// تعریف تابع cleanDuplicateVerbs قبل از استفاده
// ================================================

function cleanDuplicateVerbs() {
    let removedCount = 0;
    const seenVerbs = new Set();
    
    // حذف بی‌قاعده‌های تکراری
    const cleanIrregular = {};
    for (const [verb, data] of Object.entries(irregularVerbs)) {
        const key = verb.toLowerCase().trim();
        if (!seenVerbs.has(key)) {
            seenVerbs.add(key);
            cleanIrregular[verb] = data;
        } else {
            removedCount++;
        }
    }
    
    Object.keys(irregularVerbs).length = 0;
    Object.assign(irregularVerbs, cleanIrregular);
    
    // حذف با قاعده‌های تکراری
    seenVerbs.clear();
    const cleanRegular = [];
    for (const verb of regularVerbsList) {
        const key = verb.toLowerCase().trim();
        if (!seenVerbs.has(key)) {
            seenVerbs.add(key);
            cleanRegular.push(verb);
        } else {
            removedCount++;
        }
    }
    
    regularVerbsList.length = 0;
    regularVerbsList.push(...cleanRegular);
    
    if (removedCount > 0) {
        console.log(`🧹 ${removedCount} فعل تکراری حذف شد`);
    }
    
    return { removedCount, totalCount: Object.keys(irregularVerbs).length + regularVerbsList.length };
}

// حالا تابع rebuildDatabase رو تعریف کن
function rebuildDatabase() {
    // ... کد rebuildDatabase
}

// حالا صدا بزن
(function autoClean() {
    const result = cleanDuplicateVerbs();
    console.log(`✅ دیتابیس افعال: ${result.totalCount} فعل (${Object.keys(irregularVerbs).length} بی‌قاعده + ${regularVerbsList.length} با قاعده)`);
})();

// اجرای خودکار هنگام لود
(function autoClean() {
    const result = cleanDuplicateVerbs();
    console.log(`✅ دیتابیس افعال: ${result.totalCount} فعل (${Object.keys(irregularVerbs).length} بی‌قاعده + ${regularVerbsList.length} با قاعده)`);
})();
    // ========== 4. تابع هوشمند برای تشخیص نوع فعل ==========
    function detectVerbType(germanWord) {
        const word = germanWord.toLowerCase();
        
        // بررسی بی‌قاعده بودن
        if (irregularVerbs[word]) {
            return {
                type: "irregular",
                ...irregularVerbs[word]
            };
        }
        
        // تشخیص الگوی صرف
        let pattern = "en";
        if (word.endsWith("ieren")) pattern = "ieren";
        else if (word.endsWith("eln")) pattern = "eln";
        else if (word.endsWith("ern")) pattern = "ern";
        
        // ساخت صرف برای فعل با قاعده
        const conjugator = regularPatterns[pattern];
        if (conjugator) {
            return {
                type: "regular",
                meaning: "",
                level: "A1",
                helper: "haben",
                conjugations: {
                    present: conjugator.present(word),
                    past: conjugator.past(word),
                    perfect: conjugator.perfect(word),
                    future: "werde " + word,
                    subjunctive: "würde " + word
                }
            };
        }
        
        return null;
    }
    
    // ========== 5. تابع جستجوی پیشرفته ==========
    function searchVerbs(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // جستجو در افعال بی‌قاعده
        for (const [verb, data] of Object.entries(irregularVerbs)) {
            if (verb.includes(searchTerm) || data.meaning.includes(searchTerm)) {
                results.push({
                    german: verb,
                    persian: data.meaning,
                    level: data.level,
                    type: "irregular",
                    data: data
                });
            }
        }
        
        // جستجو در افعال با قاعده
        for (const verb of regularVerbsList) {
            if (verb.includes(searchTerm)) {
                results.push({
                    german: verb,
                    persian: "",
                    level: "A1-B2",
                    type: "regular",
                    data: detectVerbType(verb)
                });
            }
        }
        
        return results;
    }
    
    // ========== 6. دریافت همه افعال ==========
    function getAllVerbs() {
        const allVerbs = [];
        
        // اضافه کردن افعال بی‌قاعده
        for (const [verb, data] of Object.entries(irregularVerbs)) {
            allVerbs.push({
                id: `irr_${verb}`,
                german: verb,
                persian: data.meaning,
                level: data.level,
                type: "irregular",
                verbData: data
            });
        }
        
        // اضافه کردن افعال با قاعده
        for (let i = 0; i < regularVerbsList.length; i++) {
            const verb = regularVerbsList[i];
            const detected = detectVerbType(verb);
            allVerbs.push({
                id: `reg_${i}_${verb}`,
                german: verb,
                persian: detected?.meaning || "",
                level: detected?.level || "A1-B2",
                type: "regular",
                verbData: detected
            });
        }
        
        return allVerbs;
    }
    
    // ========== 7. دریافت صرف کامل یک فعل ==========
    function getConjugation(verb, level = "full") {
        const verbInfo = detectVerbType(verb);
        
        if (!verbInfo) {
            return null;
        }
        
        const isIrregular = verbInfo.type === "irregular";
        
        // زمان‌های کامل
        const conjugations = {
            // Präsens (حال ساده)
            present: {
                ich: isIrregular ? getIrregularPresent(verb, "ich") : (verbInfo.conjugations?.present || verb),
                du: isIrregular ? getIrregularPresent(verb, "du") : (verb.slice(0, -2) + "st"),
                er_sie_es: isIrregular ? getIrregularPresent(verb, "er") : (verbInfo.conjugations?.present || verb),
                wir: isIrregular ? getIrregularPresent(verb, "wir") : (verb.slice(0, -2) + "n"),
                ihr: isIrregular ? getIrregularPresent(verb, "ihr") : (verb.slice(0, -2) + "t"),
                sie_Sie: isIrregular ? getIrregularPresent(verb, "sie") : (verb.slice(0, -2) + "n")
            },
            
            // Präteritum (گذشته ساده)
            praeteritum: {
                ich: isIrregular ? (verbInfo.past || verb + "te") : (verbInfo.conjugations?.past || verb.slice(0, -2) + "te"),
                du: isIrregular ? ((verbInfo.past || verb + "te") + "st") : (verbInfo.conjugations?.past + "st" || verb.slice(0, -2) + "test"),
                er_sie_es: isIrregular ? (verbInfo.past || verb + "te") : (verbInfo.conjugations?.past || verb.slice(0, -2) + "te"),
                wir: isIrregular ? ((verbInfo.past || verb + "te") + "n") : (verbInfo.conjugations?.past + "n" || verb.slice(0, -2) + "ten"),
                ihr: isIrregular ? ((verbInfo.past || verb + "te") + "t") : (verbInfo.conjugations?.past + "t" || verb.slice(0, -2) + "tet"),
                sie_Sie: isIrregular ? ((verbInfo.past || verb + "te") + "n") : (verbInfo.conjugations?.past + "n" || verb.slice(0, -2) + "ten")
            },
            
            // Perfekt (گذشته کامل)
            perfekt: {
                helper: verbInfo.helper || "haben",
                pastParticiple: isIrregular ? (verbInfo.perfect || "ge" + verb + "t") : (verbInfo.conjugations?.perfect || "ge" + verb.slice(0, -2) + "t")
            },
            
            // Futur I (آینده)
            futur: {
                ich: `werde ${verb}`,
                du: `wirst ${verb}`,
                er_sie_es: `wird ${verb}`,
                wir: `werden ${verb}`,
                ihr: `werdet ${verb}`,
                sie_Sie: `werden ${verb}`
            },
            
            // Konjunktiv II (التزامی گذشته)
            konjunktiv: {
                ich: isIrregular ? `würde ${verb}` : `würde ${verb}`,
                du: isIrregular ? `würdest ${verb}` : `würdest ${verb}`,
                er_sie_es: isIrregular ? `würde ${verb}` : `würde ${verb}`,
                wir: isIrregular ? `würden ${verb}` : `würden ${verb}`,
                ihr: isIrregular ? `würdet ${verb}` : `würdet ${verb}`,
                sie_Sie: isIrregular ? `würden ${verb}` : `würden ${verb}`
            }
        };
        
        return conjugations;
    }
    
    // تابع کمکی برای صرف افعال بی‌قاعده در حال
    function getIrregularPresent(verb, person) {
        const irregularPresentMap = {
            "sein": { ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" },
            "haben": { ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" },
            "werden": { ich: "werde", du: "wirst", er: "wird", wir: "werden", ihr: "werdet", sie: "werden" },
            "können": { ich: "kann", du: "kannst", er: "kann", wir: "können", ihr: "könnt", sie: "können" },
            "müssen": { ich: "muss", du: "musst", er: "muss", wir: "müssen", ihr: "müsst", sie: "müssen" },
            "dürfen": { ich: "darf", du: "darfst", er: "darf", wir: "dürfen", ihr: "dürft", sie: "dürfen" },
            "wollen": { ich: "will", du: "willst", er: "will", wir: "wollen", ihr: "wollt", sie: "wollen" },
            "sollen": { ich: "soll", du: "sollst", er: "soll", wir: "sollen", ihr: "sollt", sie: "sollen" },
            "mögen": { ich: "mag", du: "magst", er: "mag", wir: "mögen", ihr: "mögt", sie: "mögen" }
        };
        
        if (irregularPresentMap[verb] && irregularPresentMap[verb][person]) {
            return irregularPresentMap[verb][person];
        }
        
        // افعال بی‌قاعده معمولی با تغییر حروف صدادار
        const stem = verb.slice(0, -2);
        const mutatedStem = stem.replace(/e(?=.$)/, "i").replace(/a(?=.$)/, "ä").replace(/o(?=.$)/, "ö");
        
        if (person === "ich") return mutatedStem + "e";
        if (person === "du") return mutatedStem + "st";
        if (person === "er") return mutatedStem + "t";
        if (person === "wir") return stem + "en";
        if (person === "ihr") return stem + "t";
        return stem + "en";
    }
    
    // ========== API عمومی ==========
    return {
        searchVerbs,
        getAllVerbs,
        getConjugation,
        detectVerbType,
        irregularCount: Object.keys(irregularVerbs).length,
        regularCount: regularVerbsList.length,
        totalCount: Object.keys(irregularVerbs).length + regularVerbsList.length
    };
})();

// اضافه کردن به window برای دسترسی جهانی
window.VerbsDatabase = VerbsDatabase;

console.log(`✅ دیتابیس افعال بارگذاری شد: ${VerbsDatabase.totalCount} فعل (${VerbsDatabase.irregularCount} بی‌قاعده + ${VerbsDatabase.regularCount} با قاعده)`);
// اجرای خودکار پاکسازی و بازسازی
(function() {
    const cleanResult = cleanDuplicateVerbs();
    const rebuiltDB = rebuildDatabase();
    console.log(`✅ دیتابیس افعال بارگذاری شد: ${rebuiltDB.totalCount} فعل (${rebuiltDB.irregularCount} بی‌قاعده + ${rebuiltDB.regularCount} با قاعده)`);
})();

// اضافه کردن به window
window.VerbsDatabase = VerbsDatabase;
window.cleanDuplicateVerbs = cleanDuplicateVerbs;
window.rebuildDatabase = rebuildDatabase;
// ================================================
// بازسازی دیتابیس بعد از پاکسازی
// ================================================

function rebuildDatabase() {
    console.log('🔄 بازسازی دیتابیس افعال...');
    
    // پاک کردن دیتابیس قبلی
    const oldSearchVerbs = searchVerbs;
    const oldGetAllVerbs = getAllVerbs;
    
    // بازسازی توابع اصلی
    const newSearchVerbs = function(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // جستجو در افعال بی‌قاعده
        for (const [verb, data] of Object.entries(irregularVerbs)) {
            if (verb.includes(searchTerm) || data.meaning.includes(searchTerm)) {
                results.push({
                    german: verb,
                    persian: data.meaning,
                    level: data.level,
                    type: "irregular",
                    data: data
                });
            }
        }
        
        // جستجو در افعال با قاعده
        for (const verb of regularVerbsList) {
            if (verb.includes(searchTerm)) {
                results.push({
                    german: verb,
                    persian: "",
                    level: "A1-B2",
                    type: "regular",
                    data: detectVerbType(verb)
                });
            }
        }
        
        return results;
    };
    
    const newGetAllVerbs = function() {
        const allVerbs = [];
        
        // اضافه کردن افعال بی‌قاعده
        for (const [verb, data] of Object.entries(irregularVerbs)) {
            allVerbs.push({
                id: `irr_${verb}`,
                german: verb,
                persian: data.meaning,
                level: data.level,
                type: "irregular",
                verbData: data
            });
        }
        
        // اضافه کردن افعال با قاعده
        for (let i = 0; i < regularVerbsList.length; i++) {
            const verb = regularVerbsList[i];
            const detected = detectVerbType(verb);
            allVerbs.push({
                id: `reg_${i}_${verb}`,
                german: verb,
                persian: detected?.meaning || "",
                level: detected?.level || "A1-B2",
                type: "regular",
                verbData: detected
            });
        }
        
        return allVerbs;
    };
    
    // جایگزینی توابع
    window.VerbsDatabase.searchVerbs = newSearchVerbs;
    window.VerbsDatabase.getAllVerbs = newGetAllVerbs;
    window.VerbsDatabase.totalCount = Object.keys(irregularVerbs).length + regularVerbsList.length;
    window.VerbsDatabase.irregularCount = Object.keys(irregularVerbs).length;
    window.VerbsDatabase.regularCount = regularVerbsList.length;
    
    console.log(`✅ دیتابیس بازسازی شد: ${window.VerbsDatabase.totalCount} فعل`);
    
    return window.VerbsDatabase;
}

// اجرای بازسازی بعد از پاکسازی
const rebuiltDB = rebuildDatabase();