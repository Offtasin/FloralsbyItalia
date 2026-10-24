#!/usr/bin/env python3
"""Build the Spanish site (es/) from the English pages.

Run from the repo root after changing any English page:

    python3 tools/build_es.py

It copies each English page into es/, swaps every piece of text using the
dictionary below, fixes paths, and lists any English text it could not
translate, so new copy never slips through in English.
"""
import html
import re
import sys
from pathlib import Path
from urllib.parse import quote, unquote

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://floralsbyitalia.vercel.app/"
PAGES = ["index.html", "bouquets.html", "pricing.html", "sizes.html", "order.html"]

# Text that stays the same in Spanish (names, ribbon examples, numbers).
KEEP = {
    "Florals", "by", "Italia", "Florals by Italia", "Instagram", "hecho con amor", "East Los Angeles",
    "Te Amo", "Happy Birthday", "Feliz Cumpleaños", "My Valentine", "Video", "@yourname",
    "Instagram @floralsbyitalia", "ES", "Ver en español", "width=device-width, initial-scale=1, viewport-fit=cover",
}

ES = {
    # head
    "Florals by Italia | Custom bouquets in East Los Angeles": "Florals by Italia | Ramos personalizados en East Los Angeles",
    "Hand-wrapped custom bouquets made to order in East Los Angeles. Text 323-842-0960.": "Ramos personalizados envueltos a mano y hechos a tu gusto en East Los Angeles. Mándanos un mensaje al 323-842-0960.",
    "Bouquets | Florals by Italia": "Ramos | Florals by Italia",
    "Recent custom bouquets by Florals by Italia in East Los Angeles: stargazers, roses, gerberas and more.": "Ramos personalizados recientes de Florals by Italia en East Los Angeles: lirios, rosas, gerberas y más.",
    "Pricing | Florals by Italia": "Precios | Florals by Italia",
    "Bouquets from $50. Sizes, add-ons, delivery, holiday pricing and how ordering works.": "Ramos desde $50. Tamaños, extras, entrega, precios de días festivos y cómo hacer tu pedido.",
    "Bouquet sizes | Florals by Italia": "Tamaños de ramos | Florals by Italia",
    "See what Small, Medium, Large and Grand bouquets from Florals by Italia look like. Bouquets from $50.": "Mira cómo se ven los ramos chicos, medianos, grandes y gigantes de Florals by Italia. Ramos desde $50.",
    "Order | Florals by Italia": "Pedidos | Florals by Italia",
    "Request a custom bouquet from Florals by Italia. Quotes usually within a day.": "Pide un ramo personalizado a Florals by Italia. Normalmente te cotizamos en menos de un día.",
    "Florals by Italia logo next to a pink gerbera and rose bouquet": "Logo de Florals by Italia junto a un ramo rosa de gerberas y rosas",
    "Florals by Italia logo next to a stargazer lily and rose bouquet": "Logo de Florals by Italia junto a un ramo de lirios y rosas",
    "Florals by Italia logo next to a pink Te Amo bouquet": "Logo de Florals by Italia junto a un ramo rosa con listón de Te Amo",
    "Florals by Italia logo next to a 100-rose graduation bouquet": "Logo de Florals by Italia junto a un ramo de graduación de 100 rosas",
    "Florals by Italia logo next to a pink birthday bouquet of lilies and roses": "Logo de Florals by Italia junto a un ramo rosa de cumpleaños con lirios y rosas",

    # nav, footer, shared
    "Skip to content": "Saltar al contenido",
    "Home": "Inicio", "Bouquets": "Ramos", "Pricing": "Precios", "Order": "Pedir", "Sizes": "Tamaños",
    "Order now": "Pide ya", "Menu": "Menú", "Breadcrumb": "Ruta de navegación",
    "Book now": "Reservar", "Holiday booking": "Reservas para días festivos",
    "Start your order": "Haz tu pedido", "See our bouquets": "Ve nuestros ramos",
    "Text us": "Escríbenos", "Phone": "Teléfono", "Start an order": "Haz un pedido",
    "Custom bouquets": "Ramos personalizados", "Made to order in East Los Angeles.": "Hechos a tu gusto en East Los Angeles.",
    "Pickup and local delivery.": "Para recoger o con entrega local.", "Contact": "Contacto", "Pages": "Páginas",
    "Florals by Italia logo": "Logo de Florals by Italia",
    "Ready when": "Cuando tú", "you are": "quieras",
    "Tell us the date and the vibe. We'll send you a design idea and an exact price.": "Dinos la fecha y el estilo. Te mandamos una idea de diseño y el precio exacto.",
    "Want one like": "¿Quieres uno como", "these?": "estos?",
    "Send us a photo or describe your dream bouquet. We'll make it happen.": "Mándanos una foto o describe el ramo de tus sueños. Lo hacemos realidad.",

    # home
    "wrapped by hand": "envueltos a mano", "Bouquets wrapped by hand": "Ramos envueltos a mano",
    "Tell us the occasion, the colors and the flowers they love. We'll build a bouquet around them and send your price before you pay a thing.": "Cuéntanos la ocasión, los colores y las flores que le encantan. Armamos un ramo a su medida y te mandamos el precio antes de que pagues nada.",
    "Bouquets from $50": "Ramos desde $50",
    "Birthdays": "Cumpleaños", "Anniversaries": "Aniversarios", "Valentine's Day": "San Valentín", "Mother's Day": "Día de las Madres",
    "Graduations": "Graduaciones", "Quinceañeras": "Quinceañeras", "Just because": "Porque sí",
    "Every bouquet is wrapped by hand for": "Cada ramo se envuelve a mano para", "one person": "una persona",
    "and one moment, in the colors and flowers they love.": "y un momento, con los colores y las flores que le encantan.",
    "See recent bouquets": "Ve ramos recientes", "View pricing": "Ver precios",
    "Say it on the": "Dilo en el", "ribbon": "listón",
    "Add a satin ribbon lettered in gold glitter with a name, a date or a few words. English or Spanish, whatever sounds like you.": "Agrega un listón de satín con letras de brillantina dorada: un nombre, una fecha o unas palabras. En español o en inglés, como suene más a ti.",
    "Made for": "Hechos para", "their": "su", "moment": "momento",
    "Real bouquets at real birthdays, parties and pickups around LA. Tag @floralsbyitalia and yours could be next.": "Ramos de verdad en cumpleaños, fiestas y entregas por todo LA. Etiqueta a @floralsbyitalia y el tuyo podría ser el próximo.",
    "Happy birthday!": "¡Feliz cumpleaños!", "Ready for pickup": "Listo para recoger", "Party ready": "Listo para la fiesta",
    "Introduction": "Introducción", "About": "Nosotros", "Ribbon examples": "Ejemplos de listones",
    "Pink gerbera and rose bouquet in cream bow print wrap": "Ramo de gerberas rosas y rosas en papel crema con moños estampados",
    "Customer holding a pink lily and rose birthday bouquet with a Happy Birthday ribbon in front of bougainvillea": "Clienta con un ramo de cumpleaños de lirios rosas y rosas con listón de Happy Birthday frente a una bugambilia",
    "Lavender-wrapped pink gerbera and rose bouquet ready for pickup": "Ramo de gerberas rosas y rosas en papel lila, listo para recoger",
    "Instant photos of a couple at a birthday party holding a stargazer bouquet": "Fotos instantáneas de una pareja en una fiesta de cumpleaños con un ramo de lirios",
    "Customer holding a pink wrapped bouquet with a Te Amo ribbon": "Clienta con un ramo en papel rosa con listón de Te Amo",

    # bouquets
    "Our": "Nuestros", "bouquets": "ramos",
    "Every one of these was made for someone. See one you love? Ask for it and we'll make it yours in your colors and size.": "Cada uno se hizo para alguien. ¿Viste uno que te encanta? Pídelo y lo hacemos tuyo, en tus colores y tamaño.",
    "Fresh off": "Recién salidos de", "her table": "su mesa",
    "Twelve recent bouquets, each made for one person and one date.": "Doce ramos recientes, cada uno hecho para una persona y una fecha.",
    "Featured bouquets": "Ramos destacados", "Size on request": "Tamaño a pedido", "Ask for this look": "Pide este estilo",
    "Lilies & roses": "Lirios y rosas", "Lilies &amp; roses": "Lirios y rosas",
    "Stargazer lilies, pink roses, filler flowers": "Lirios stargazer, rosas rosas, flores de relleno",
    "Lily garden": "Jardín de lirios", "Stargazer lilies, pink and white roses, filler flowers": "Lirios stargazer, rosas rosas y blancas, flores de relleno",
    "Bi-color roses, tulips, ribbon lettering": "Rosas bicolor, tulipanes, listón con letras",
    "Medical grad roses": "Rosas de graduación de medicina", "Red roses, baby's breath caduceus, black and gold wrap": "Rosas rojas, caduceo de nube, papel negro y dorado",
    "Gerbera bow": "Gerberas con moño", "Pink gerberas, pink and cream roses, bow print wrap": "Gerberas rosas, rosas rosas y crema, papel con moños estampados",
    "Picnic reds": "Rojos de picnic", "Red roses, carnations, hydrangea, berries, gingham wrap": "Rosas rojas, claveles, hortensias, bayas, papel de cuadritos",
    "Birthday lilies": "Lirios de cumpleaños", "Pink lilies, garden roses, tulips, ribbon lettering": "Lirios rosas, rosas de jardín, tulipanes, listón con letras",
    "Te Amo mix": "Mezcla Te Amo", "Lilies, mums, carnations, tulips, roses, baby's breath": "Lirios, crisantemos, claveles, tulipanes, rosas, nube",
    "Leopard duo": "Dúo leopardo", "Peach gerberas, pink and white roses, leopard wrap": "Gerberas durazno, rosas rosas y blancas, papel de leopardo",
    "Grad roses": "Rosas de graduación", "Red roses, baby's breath, gold butterfly, grad cap": "Rosas rojas, nube, mariposa dorada, birrete",
    "Valentine noir": "San Valentín negro", "Red and white roses, baby's breath, lilies, black wrap": "Rosas rojas y blancas, nube, lirios, papel negro",
    "BF bouquet": "Ramo para novio", "Blue and white roses, baby's breath, ribbon lettering": "Rosas azules y blancas, nube, listón con letras",
    "Browse by": "Busca por", "size": "tamaño",
    "See real bouquets in every size, from a sweet dozen to the full ramo buchón.": "Ve ramos de verdad en cada tamaño, desde una docena hasta el ramo buchón completo.",
    "Small": "Chico", "Medium": "Mediano", "Large": "Grande", "Grand": "Gigante",
    "10–12 stems": "10–12 tallos", "About 25 stems": "Unos 25 tallos", "About 50 stems": "Unos 50 tallos", "100 stems and up": "100 tallos o más",
    "from": "desde", "See examples": "Ver ejemplos", "Most popular": "El más pedido",
    "A sweet surprise or just because.": "Una sorpresa linda o porque sí.",
    "Birthdays, dates and thank-yous.": "Cumpleaños, citas y para dar las gracias.",
    "Anniversaries and big birthdays.": "Aniversarios y cumpleaños especiales.",
    "The full ramo buchón moment.": "El momento ramo buchón completo.",
    "Pink roses with stargazer lilies, alstroemeria and purple stock in pink wrap": "Rosas rosas con lirios stargazer, astromelias y alhelí morado en papel rosa",
    "Pink stargazer lilies with pink and white roses, alstroemeria and purple stock in pink wrap": "Lirios stargazer rosas con rosas rosas y blancas, astromelias y alhelí morado en papel rosa",
    "Bi-color pink roses and tulips with a white ribbon reading My Valentine in gold": "Rosas rosas bicolor y tulipanes con un listón blanco que dice My Valentine en dorado",
    "Over 100 red roses in black and gold wrap with a medical caduceus made of baby's breath": "Más de 100 rosas rojas en papel negro y dorado con un caduceo de medicina hecho de nube",
    "Pink gerbera daisies with pink and cream roses in cream paper printed with gold bows": "Gerberas rosas con rosas rosas y crema en papel crema con moños dorados estampados",
    "Two bouquets of red roses, carnations, pink hydrangea and hypericum berries in red gingham wrap": "Dos ramos de rosas rojas, claveles, hortensias rosas y bayas de hypericum en papel rojo de cuadritos",
    "Pink lilies, garden roses and tulips in white star-cut wrap with a Happy Birthday ribbon": "Lirios rosas, rosas de jardín y tulipanes en papel blanco con corte de estrella y listón de Happy Birthday",
    "Pink wrapped bouquet of lilies, white mums, carnations, tulips, roses and baby's breath with a Te Amo ribbon": "Ramo en papel rosa con lirios, crisantemos blancos, claveles, tulipanes, rosas y nube con listón de Te Amo",
    "Two bouquets of peach-pink gerberas with pink and white roses in pink leopard print wrap": "Dos ramos de gerberas rosa durazno con rosas rosas y blancas en papel rosa de leopardo",
    "Red roses ringed with baby's breath in black wrap with a gold butterfly, graduation cap and Congratulations ribbon": "Rosas rojas rodeadas de nube en papel negro con mariposa dorada, birrete y listón de Congratulations",
    "Red and white roses with baby's breath and pink lilies in black wrap with a Happy Valentine's Day ribbon": "Rosas rojas y blancas con nube y lirios rosas en papel negro con listón de Happy Valentine's Day",
    "Blue and white roses with baby's breath in black wrap, with I Love You ribbons and a white bow": "Rosas azules y blancas con nube en papel negro, con listones de I Love You y un moño blanco",

    # pricing
    "Pricing &amp;": "Precios y", "how it works": "cómo funciona",
    "Every bouquet is quoted after we talk, since flower type, count and wrap all change the cost. These are where most orders start.": "Cada ramo se cotiza después de platicar, porque el tipo de flor, la cantidad y el papel cambian el precio. Aquí empiezan la mayoría de los pedidos.",
    "Tap a size to see examples. We'll fine-tune the count and flowers to your budget.": "Toca un tamaño para ver ejemplos. Ajustamos la cantidad y las flores a tu presupuesto.",
    "Book ahead for big dates": "Reserva con tiempo para fechas especiales",
    "Holiday bouquets cost more because flower prices jump that week, and spots fill fast.": "Los ramos de días festivos cuestan más porque las flores suben de precio esa semana, y los lugares se llenan rápido.",
    "Sun, Feb 14": "dom, 14 feb", "Book by": "Reserva antes del", "Feb 7": "7 de febrero", "Sun, May 9": "dom, 9 may", "May 2": "2 de mayo",
    "Graduation season": "Temporada de graduaciones", "May and June": "Mayo y junio", "Book 1 week ahead": "Reserva con 1 semana",
    "Add-ons": "Extras", "Add-ons and delivery": "Extras y entrega",
    "Ribbon with gold lettering": "Listón con letras doradas", "Butterflies, pearls or rhinestones": "Mariposas, perlas o pedrería",
    "from $10": "desde $10", "Mini crown": "Mini corona", "from $15": "desde $15", "Heart or number balloon": "Globo de corazón o de número",
    "Getting it there": "Cómo te llega", "Pickup in East LA": "Recoger en East LA", "Free": "Gratis",
    "Delivery nearby": "Entrega cerca", "Delivery across LA": "Entrega en todo LA",
    "How ordering": "Cómo hacer", "works": "tu pedido",
    "No checkout and no guessing. You tell us what you want and we send you an exact price.": "Sin carrito y sin adivinar. Tú nos dices lo que quieres y te mandamos el precio exacto.",
    "Send your request": "Manda tu pedido",
    "Fill out the order form or text us. Add a photo if you have a look in mind.": "Llena el formulario o mándanos un mensaje. Agrega una foto si tienes un estilo en mente.",
    "Get your quote": "Recibe tu cotización",
    "We'll reply with a design idea and an exact price, usually within a day.": "Te contestamos con una idea de diseño y el precio exacto, normalmente en menos de un día.",
    "Pay a 20% deposit": "Paga un depósito del 20%",
    "The deposit holds your date and lets us order your flowers. The rest is due at pickup or delivery.": "El depósito aparta tu fecha y nos deja comprar tus flores. El resto se paga al recoger o en la entrega.",
    "Pick up or get it delivered": "Recógelo o te lo llevamos",
    "Fresh the day you need it, wrapped and ready to hand over.": "Fresco el día que lo necesitas, envuelto y listo para regalar.",
    "Questions": "Preguntas", "Don't see yours? Text us and we'll answer.": "¿No ves la tuya? Escríbenos y te contestamos.",
    "How far ahead should I order?": "¿Con cuánto tiempo debo pedir?",
    "Three days ahead works for most bouquets. For 100 stems and up, and for Valentine's Day or Mother's Day, order at least a week ahead.": "Con tres días basta para la mayoría de los ramos. Para 100 tallos o más, y para San Valentín o el Día de las Madres, pide con al menos una semana.",
    "How does the deposit work?": "¿Cómo funciona el depósito?",
    "Once you approve your quote, a 20% deposit holds your date and lets us buy your flowers. The rest is due at pickup or delivery.": "Cuando apruebas tu cotización, un depósito del 20% aparta tu fecha y nos deja comprar tus flores. El resto se paga al recoger o en la entrega.",
    "Why do prices go up on holidays?": "¿Por qué suben los precios en días festivos?",
    "Flower prices jump the week of Valentine's Day, Mother's Day and other big holidays, so holiday bouquets cost more than the starting prices above.": "Las flores suben de precio la semana de San Valentín, el Día de las Madres y otros días festivos grandes, así que esos ramos cuestan más que los precios de arriba.",
    "Can you match a photo I found?": "¿Pueden hacer un ramo como el de una foto que encontré?",
    "Yes. Send the photo with your request and we'll tell you what it takes to make it, or suggest swaps that fit your budget.": "Sí. Manda la foto con tu pedido y te decimos qué se necesita para hacerlo, o te sugerimos cambios que quepan en tu presupuesto.",
    "Where do you deliver?": "¿A dónde entregan?",
    "We're based in East Los Angeles and deliver around LA. The delivery fee depends on distance and is included in your quote.": "Estamos en East Los Angeles y entregamos por todo LA. El costo de entrega depende de la distancia y viene incluido en tu cotización.",
    "How do I keep it fresh?": "¿Cómo lo mantengo fresco?",
    "Trim the stems at an angle, put them in cool water and change the water every couple of days. Keep the bouquet out of direct sun.": "Corta los tallos en diagonal, ponlos en agua fresca y cámbiala cada par de días. Mantén el ramo lejos del sol directo.",

    # sizes
    "Bouquet": "Tamaños de", "sizes": "ramos", "Bouquet sizes": "Tamaños de ramos",
    "From a sweet dozen to the full ramo buchón. Every bouquet is quoted to your flowers and wrap, and holiday dates run higher.": "Desde una docena hasta el ramo buchón completo. Cada ramo se cotiza según tus flores y papel, y en días festivos el precio sube.",
    "stems": "tallos",
    "10–12 stems. From": "10–12 tallos. Desde", "About 25 stems. From": "Unos 25 tallos. Desde",
    "About 50 stems. From": "Unos 50 tallos. Desde", "100 stems and up. From": "100 tallos o más. Desde",
    "A sweet surprise, a thank-you or just because. Easy to carry and perfect for one person.": "Una sorpresa linda, para dar las gracias o porque sí. Fácil de llevar y perfecto para una persona.",
    "Order a small bouquet": "Pide un ramo chico",
    "Small. Blue and white roses, baby's breath, \"I love you\" ribbon.": "Chico. Rosas azules y blancas, nube, listón de \"I love you\".",
    "Our most popular size. Full enough for birthdays, dates and celebrations.": "Nuestro tamaño más pedido. Bien lleno para cumpleaños, citas y celebraciones.",
    "Order a medium bouquet": "Pide un ramo mediano",
    "Medium. Lilies, mums, carnations, tulips, roses, baby's breath, \"Te Amo\" ribbon.": "Mediano. Lirios, crisantemos, claveles, tulipanes, rosas, nube, listón de \"Te Amo\".",
    "Medium. Red roses, carnations, hydrangea, berries, gingham wrap.": "Mediano. Rosas rojas, claveles, hortensias, bayas, papel de cuadritos.",
    "Medium. Red roses, baby's breath, gold butterfly, grad cap, \"Congratulations\" ribbon.": "Mediano. Rosas rojas, nube, mariposa dorada, birrete, listón de \"Congratulations\".",
    "A big, full bouquet for anniversaries, milestone birthdays and graduations.": "Un ramo grande y lleno para aniversarios, cumpleaños especiales y graduaciones.",
    "Order a large bouquet": "Pide un ramo grande",
    "Large. Pink gerberas, pink and cream roses, bow print wrap.": "Grande. Gerberas rosas, rosas rosas y crema, papel con moños estampados.",
    "Large. Peach gerberas, pink and white roses, leopard wrap.": "Grande. Gerberas durazno, rosas rosas y blancas, papel de leopardo.",
    "Large. Pink lilies, garden roses, tulips, \"Happy Birthday\" ribbon.": "Grande. Lirios rosas, rosas de jardín, tulipanes, listón de \"Happy Birthday\".",
    "Large. Red and white roses, baby's breath, lilies, black wrap.": "Grande. Rosas rojas y blancas, nube, lirios, papel negro.",
    "The full ramo buchón moment. Made to turn heads.": "El momento ramo buchón completo. Hecho para que todos volteen a verlo.",
    "Order a grand bouquet": "Pide un ramo gigante",
    "Grand. Red roses, baby's breath caduceus, black and gold wrap.": "Gigante. Rosas rojas, caduceo de nube, papel negro y dorado.",
    "Grand. Stargazer lilies, pink and white roses, filler flowers.": "Gigante. Lirios stargazer, rosas rosas y blancas, flores de relleno.",
    "All sizes at a": "Todos los tamaños de un", "glance": "vistazo",
    "Starting prices for standard flowers and wrap. Premium blooms, add-ons and holiday dates add to the quote.": "Precios iniciales con flores y papel estándar. Flores premium, extras y días festivos suben la cotización.",
    "Size": "Tamaño", "Stems": "Tallos", "Starting at": "Desde", "Best for": "Ideal para", "Examples": "Ejemplos",
    "A thank-you, a first date, just because": "Dar las gracias, una primera cita, porque sí",
    "Birthdays, anniversaries, graduations": "Cumpleaños, aniversarios, graduaciones",
    "Milestone birthdays and big celebrations": "Cumpleaños especiales y grandes celebraciones",
    "Proposals, quinceañeras, unforgettable moments": "Propuestas, quinceañeras, momentos inolvidables",

    # order
    "Quotes usually within a day": "Cotizamos normalmente en menos de un día",
    "Start your": "Haz tu", "order": "pedido",
    "Tell us what you're picturing. When you're done, text it to us or send it on Instagram, and we'll reply with your quote.": "Cuéntanos lo que te imaginas. Cuando termines, mándanoslo por mensaje o por Instagram y te contestamos con tu cotización.",
    "Order form": "Formulario de pedido",
    "Your name": "Tu nombre", "Phone number": "Número de teléfono", "optional": "opcional",
    "Date you need it": "Fecha en que lo necesitas", "Occasion": "Ocasión",
    "Birthday": "Cumpleaños", "Anniversary": "Aniversario", "Graduation": "Graduación", "Quinceañera": "Quinceañera",
    "Something else": "Otra cosa", "Budget": "Presupuesto",
    "Just flowers": "Solo flores", "Not sure": "No sé",
    "loose stems, no wrap, to arrange yourself": "tallos sueltos, sin papel, para que tú los arregles",
    "A dozen roses": "Una docena de rosas", "Two dozen roses": "Dos docenas de rosas", "Stargazer lily stems": "Tallos de lirio stargazer",
    "Gerbera daisies": "Gerberas", "Baby's breath bunch": "Manojo de nube", "Mixed stems for a vase": "Tallos variados para florero",
    "Greenery and filler": "Follaje y relleno", "Which stems do you need?": "¿Qué tallos necesitas?",
    "Colors": "Colores", "Ribbon lettering": "Letras para el listón", "Pickup or delivery": "Recoger o entrega",
    "Delivery": "Entrega a domicilio",
    "Inspiration photo": "Foto de inspiración",
    "optional, up to 4, a look you love or a screenshot": "opcional, hasta 4, un estilo que te encante o una captura de pantalla",
    "Add a photo": "Agregar foto", "4 photos max": "Máximo 4 fotos",
    "Anything else": "Algo más",
    "A 20% deposit holds your date once you approve your quote.": "Un depósito del 20% aparta tu fecha cuando apruebas tu cotización.",
    "Review my request": "Revisar mi pedido", "Your request is ready": "Tu pedido está listo",
    "Send it by text or Instagram and we'll reply with your quote. We copied it for you too.": "Mándalo por mensaje o por Instagram y te contestamos con tu cotización. También te lo copiamos.",
    "Don't forget your photo.": "No olvides tu foto.",
    "When your text or Instagram chat opens, attach your inspiration photo before you send.": "Cuando se abra tu mensaje o el chat de Instagram, adjunta tu foto de inspiración antes de enviar.",
    "Text it to us": "Mándalo por mensaje", "Share with photo": "Compartir con foto",
    "Send on Instagram": "Mandar por Instagram", "Copy request": "Copiar pedido",
    "Rather text?": "¿Prefieres escribir?",
    "Send us a message with your date and what you're picturing.": "Mándanos un mensaje con tu fecha y lo que te imaginas.",
    "Pickup in East Los Angeles": "Para recoger en East Los Angeles", "Delivery around LA": "Entrega por todo LA",
    "20% deposit holds your date": "Un depósito del 20% aparta tu fecha",
    "Small (10–12 stems, from $50)": "Chico (10–12 tallos, desde $50)",
    "Medium (~25 stems, from $85)": "Mediano (~25 tallos, desde $85)",
    "Large (~50 stems, from $140)": "Grande (~50 tallos, desde $140)",
    "Grand (100+ stems, from $250)": "Gigante (100+ tallos, desde $250)",
    "Just flowers (loose stems, no wrap)": "Solo flores (tallos sueltos, sin papel)",
    "Not sure yet": "Todavía no sé",
    "Example: 30 pink roses and 2 bunches of baby's breath for table centerpieces": "Ejemplo: 30 rosas rosas y 2 manojos de nube para centros de mesa",
    "Pink and white, all red…": "Rosa y blanco, todo rojo…",
    "Te Amo, Happy 21st Bella…": "Te Amo, Feliz 21 Bella…",
    "Inspiration, delivery area, a bouquet from our site you liked…": "Ideas, zona de entrega, un ramo de la página que te gustó…",
}

TEXT_ATTRS = ("alt", "aria-label", "placeholder", "title", "data-name", "data-mix", "data-size", "data-look", "value")


def translate_page(name, missing):
    s = (ROOT / name).read_text()
    path = "" if name == "index.html" else name

    def tr(text, where):
        core = text.strip()
        if not re.search(r"[A-Za-z]", core) or core in KEEP:
            return text
        if core in ES:
            return text.replace(core, ES[core])
        missing.add(f"{name} ({where}): {core}")
        return text

    # Keep scripts and styles out of the text pass.
    parts = re.split(r"(<script\b.*?</script>|<style\b.*?</style>)", s, flags=re.S)
    for i in range(0, len(parts), 2):
        p = parts[i]
        p = re.sub(r">([^<>]+)<", lambda m: ">" + tr(m.group(1), "text") + "<", p)
        p = re.sub(
            r'\b(%s)="([^"]*)"' % "|".join(TEXT_ATTRS),
            lambda m: f'{m.group(1)}="{tr(m.group(2), m.group(1))}"',
            p,
        )
        p = re.sub(
            r'(<meta (?:name="description"|property="og:(?:title|description|image:alt)") content=")([^"]*)"',
            lambda m: m.group(1) + tr(m.group(2), "meta") + '"',
            p,
        )
        parts[i] = p
    s = "".join(parts)

    # "Ask for this look" links carry the Spanish bouquet name to the order form.
    def look(m):
        en = unquote(m.group(1))
        return "order.html?look=" + quote(ES.get(en, en), safe="")
    s = re.sub(r"order\.html\?look=([^\"&]+)", look, s)

    s = s.replace('<html lang="en">', '<html lang="es">', 1)
    # Paths: pages live one folder down.
    s = re.sub(r'((?:href|src|poster)=")(assets/)', r"\1../\2", s)
    s = re.sub(r"(srcset=\")([^\"]*)", lambda m: m.group(1) + m.group(2).replace("assets/", "../assets/"), s)
    s = s.replace(f'<link rel="canonical" href="{BASE}{path}">', f'<link rel="canonical" href="{BASE}es/{path}">')
    s = s.replace(f'<meta property="og:url" content="{BASE}{path}">', f'<meta property="og:url" content="{BASE}es/{path}">')
    s = s.replace('<meta property="og:site_name"', '<meta property="og:locale" content="es_MX">\n<meta property="og:site_name"', 1)
    # Language switch points back to English.
    s = s.replace(
        f'<a class="lang" href="es/{path}" hreflang="es" lang="es" aria-label="Ver en español">ES</a>',
        f'<a class="lang" href="../{path}" hreflang="en" lang="en" aria-label="View in English">EN</a>',
    )
    if 'class="lang" href="../' not in s:
        missing.add(f"{name}: language switch not found")
    return s


def main():
    missing = set()
    out = ROOT / "es"
    out.mkdir(exist_ok=True)
    for name in PAGES:
        (out / name).write_text(translate_page(name, missing))
    if missing:
        print("Not translated yet (add to ES in tools/build_es.py):")
        for m in sorted(missing):
            print("  -", m)
        sys.exit(1)
    print(f"Built {len(PAGES)} Spanish pages in es/")


if __name__ == "__main__":
    main()
