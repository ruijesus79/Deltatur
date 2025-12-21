
import { KnowledgeArticle, GalleryImage, StaffMember, EmergencyContact, Boat } from '../types';

export const INITIAL_FLEET: Boat[] = [
  { 
    id: 'd1', 
    name: 'Delta I', 
    cap: 18, 
    photoUrl: 'https://deltatur.pt/wp-content/uploads/2025/09/DIA-4-FOTOGRAFIA-91.webp',
    videoUrl: 'https://deltatur.pt/wp-content/uploads/2025/09/VIDEO-4-compressed.mp4',
    info: 'A embarcação Delta I é robusta e versátil, perfeita para navegação estável no Douro.'
  },
  { 
    id: 'd2', 
    name: 'Delta II', 
    cap: 7, 
    photoUrl: 'https://lh3.googleusercontent.com/p/AF1QipMMBJCENzBLI_kdUkkxjnTUuc0n2FF2qPyAuwOS=s1360-w1360-h1020',
    info: 'Ideal para passeios privados românticos ou pequenos grupos VIP. Embarcação ágil com acabamentos de excelência.'
  },
  { 
    id: 'd3', 
    name: 'Delta III', 
    cap: 20,
    photoUrl: 'https://deltatur.pt/wp-content/uploads/2025/08/DJI_0119-1024x576.webp',
    info: 'Barco de grande capacidade (20 pax). Referência visual para grupos de tour clássicos.'
  },
  { 
    id: 'd4', 
    name: 'Delta IV', 
    cap: 20,
    photoUrl: 'https://deltatur.pt/wp-content/uploads/2025/09/EDIT0633-1024x683.webp',
    tiktokUrl: 'https://www.tiktok.com/@deltatur/video/7511799786622815520',
    info: 'Embarcação de alto rendimento com presença forte nas redes sociais.'
  },
  { 
    id: 'd5', 
    name: 'Delta V', 
    cap: 16, 
    photoUrl: 'https://lh3.googleusercontent.com/p/AF1QipOXeldUeGlXEIj6XeMbUAjUXBlUIZ0g_RyM8G2U=s1360-w1360-h1020',
    info: 'A mais recente adição à frota, focada no equilíbrio entre agilidade e conforto para grupos médios.'
  },
];

export const INITIAL_TEAM: StaffMember[] = [
  { id: 't1', name: 'Rui Jesus', role: 'SKIPPER', active: true },
  { id: 't2', name: 'Liliana Martins', role: 'STAFF', active: true },
  { id: 't3', name: 'Nuno Diz', role: 'SKIPPER', active: true },
  { id: 't4', name: 'Adriano Ferronha', role: 'SKIPPER', active: true },
  { id: 't5', name: 'António Martinho', role: 'SKIPPER', active: true },
  { id: 't6', name: 'Ariel', role: 'MARINHEIRO', active: true },
  { id: 't7', name: 'Diogo Alves', role: 'MARINHEIRO', active: true },
  { id: 't8', name: 'Maria Teresa', role: 'STAFF', active: true },
  { id: 't9', name: 'Telmo Moura', role: 'SKIPPER', active: true },
  { id: 't10', name: 'Pedro', role: 'MARINHEIRO', active: true },
  { id: 't11', name: 'Sucena Fraguito', role: 'MARINHEIRO', active: true },
  { id: 't12', name: 'Tiago Azevedo', role: 'SKIPPER', active: true },
  { id: 't13', name: 'José Pereira', role: 'SKIPPER', active: true },
  { id: 't14', name: 'Leandro', role: 'MARINHEIRO', active: true }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'e1', name: 'Capitania (Douro)', phone: '+351 229 390 700', type: 'EMERGENCY' },
  { id: 'e2', name: 'Bombeiros Pinhão', phone: '+351 254 732 122', type: 'EMERGENCY' },
  { id: 'e3', name: 'GNR Pinhão', phone: '+351 254 738 120', type: 'SECURITY' },
  { id: 'e4', name: 'APDL Eclusas (Régua)', phone: '+351 254 320 000', type: 'OPS' },
  { id: 'e5', name: 'Posto Capitania Pinhão', phone: '+351 254 732 114', type: 'EMERGENCY' }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // --- HISTÓRIA (ATUALIZADA) ---
  {
    id: 'historia_filoxera_douro',
    category: 'HISTÓRIA',
    title: 'A Praga da Filoxera e os "Mortórios"',
    content: `Em 1868, a Filoxera chegou ao Douro e dizimou a região. O impacto foi tão brutal que muitas quintas foram abandonadas, deixando para trás os chamados **"Mortórios"**: socalcos de pedra vazios, sem vinha, que ainda hoje marcam a paisagem como cicatrizes de uma guerra perdida contra a natureza.\n\nEstes muros "mortos" lembram a era pré-filoxera e a titânica reconstrução que se seguiu.`,
    imageUrls: [
      'https://douropromenade.com/wp-content/uploads/2021/01/filoxera-in-Douro-Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Phylloxera_galls_on_leaves.jpg/800px-Phylloxera_galls_on_leaves.jpg'
    ]
  },
  {
    id: 'historia_enxertia_raizes',
    category: 'HISTÓRIA',
    title: 'Enxertia Americana: A Solução',
    content: `Para salvar o vinho, o Douro teve de mudar as suas raízes. A **Enxertia Americana** é a técnica cirúrgica onde se une a casta nobre europeia (o "Garfo") a uma raiz americana resistente ao inseto (o "Porta-enxerto" ou "Cavalo").\n\n1. **O Cavalo:** Raiz americana (*Vitis labrusca*), imune à filoxera.\n2. **O Garfo:** Casta portuguesa (Touriga, Malvasia, etc.).\n3. **O Ciclo:** A seiva sobe pela raiz americana e alimenta a uva portuguesa.`,
    imageUrls: [
      'https://www.clubevinhosportugueses.pt/wp-content/uploads/2014/08/tronco_rebento-753x1024.jpg',
      'https://www.decantandoavida.com/wp-content/uploads/2012/01/enxerto.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Grafting.png/640px-Grafting.png'
    ]
  },
  {
    id: 'historia_solo_xisto_douro',
    category: 'HISTÓRIA',
    title: 'O Solo do Xisto',
    content: `A geologia mágica do Douro. O xisto retém o calor e a humidade, forçando as raízes das vinhas a mergulhar dezenas de metros nas rochas para encontrar água, criando vinhos únicos.\n\n**O Douro é xisto e o xisto é Douro.**`,
    imageUrls: ['https://beira.pt/wp-content/uploads/2021/11/muros-xisto.jpg']
  },
  {
    id: 'historia_aldeias_xisto',
    category: 'HISTÓRIA',
    title: 'Arquitetura de Xisto',
    content: `A pedra que ergueu o Douro. As aldeias vinhateiras e os solares foram construídos com a mesma rocha que sustenta as videiras, criando uma harmonia perfeita entre o homem e a natureza.`,
    imageUrls: [
        'https://imagens.publico.pt/imagens.aspx/1650288?tp=UH&db=IMAGENS&type=JPG',
        'https://thumbs.web.sapo.io/?H=960&W=1920&crop=center&delay_optim=1&epic=V2%3Aga7LFTVocD5fCeLnITaq2wKfXsk55AhfcTWF5KCK4eE9FoZN13gtkZ4RSei0J84GuKHLMUhHE1QflmvcUdsaiJZxPagqSwp9kI2wKLcIhe1rFYYJN15MpybCfC78kP%2Bb&webp=1&Q=50&tv=1'
    ]
  },

  // --- LOGÍSTICA ---
  {
    id: 'logistica_cais_deltatur',
    category: 'LOGÍSTICA',
    title: 'Cais Deltatur (Pinhão)',
    content: `O nosso porto de abrigo. Localizado na margem direita do rio, com acesso facilitado para passageiros de todas as idades.\n\n**Coordenadas:** 41.1903, -7.5447.\n**Dica:** Ponto de encontro principal para todos os tours privados e partilhados.`,
    imageUrls: ['https://lh3.googleusercontent.com/p/AF1QipMHkHTBylQJlCxvpzIrWE1PmnpMZQ_DtmsJUljK=s1360-w1360-h1020'],
    website: 'deltatur.pt'
  },
  {
    id: 'logistica_estacao_pinhao',
    category: 'LOGÍSTICA',
    title: 'Estação Ferroviária do Pinhão',
    content: `Uma das estações mais bonitas de Portugal. Seus 24 painéis de azulejos contam a história visual do Douro: a vindima, o pisar das uvas e o transporte no Rabelo.\n\n**Curiosidade:** Os painéis são datados de 1937.\n**Dica:** Ponto ideal para fotos culturais com os turistas.`,
    imageUrls: ['https://aleluia.pt/wp-content/uploads/2019/06/cover-pinhao.jpg'],
    website: 'www.cp.pt'
  },
  {
    id: 'logistica_comboio_historico',
    category: 'LOGÍSTICA',
    title: 'Comboio Histórico do Douro',
    content: `Viagem nostálgica entre Pinhão e Tua com locomotiva a vapor e carruagens de madeira.\n\n**Operação:** Junho a Outubro.\n**Atenção:** Reservas obrigatórias via CP.`,
    imageUrls: ['https://www.roteirododouro.com/wp-content/uploads/ComboioHistoricoDouro-10.jpg'],
    website: 'www.cp.pt/info/w/douro-historical'
  },

  // --- ATIVIDADES ---
  {
    id: 'atividade_trilho_loivos',
    category: 'ATIVIDADES',
    title: 'Trilho Casal de Loivos',
    content: `O percurso PR20 de Alijó oferece a vista "S" do Douro. Caminhada entre vinhas com elevação desafiante mas recompensadora.\n\n**Dificuldade:** Média.\n**Duração:** 1h30m para subir.`,
    imageUrls: ['https://turismo.cm-alijo.pt/thumbs/cmalijo/uploads/poi/image/295/pr20_alj_1_2500_2500.jpg']
  },
  {
    id: 'atividade_kayak_pinhao',
    category: 'ATIVIDADES',
    title: 'Kayak no Rio Pinhão',
    content: `Exploração suave do afluente Rio Pinhão. Águas paradas, sem correntes fortes, ideal para observação de aves e momentos de silêncio absoluto.`,
    imageUrls: ['https://comportugal.com/fichuprelanex/fx13996344060.JPG']
  },

  // --- ALDEIAS & COMÉRCIO ---
  {
    id: 'aldeia_provesende_hist',
    category: 'ALDEIAS',
    title: 'Provesende: Vila Histórica',
    content: `Famosa pelas suas casas senhoriais e solares. Uma das Aldeias Vinhateiras do Douro que mantém o traçado original do séc. XVIII.\n\n**Visitar:** O pelourinho e a padaria tradicional.`,
    imageUrls: ['https://www.roteirododouro.com/wp-content/uploads/Provesende-1.jpg']
  },
  {
    id: 'comercio_garrafeiras_pinhao',
    category: 'COMERCIO',
    title: 'Garrafeiras do Pinhão',
    content: `Seleção de elite dos vinhos da região. O melhor local para encontrar colheitas raras e vinhos de pequenos produtores da zona alta do Douro.`,
    imageUrls: ['https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=center,quality=60,width=535,height=400,dpr=2/tour_img/762fb9dcf33d605b5d254d7a7f0e1abd06ddf5fb82c82359be24ec57c0a6d92e.jpg']
  },
  {
    id: 'comercio_mercado_pinhao',
    category: 'COMERCIO',
    title: 'Mercado Municipal do Pinhão',
    content: `Onde a terra encontra a mesa. Azeite, amêndoas e mel local. Situado estrategicamente próximo à estação.`,
    imageUrls: ['https://www.vagamundos.pt/wp-content/uploads/2020/07/Visitar-Pinhao-Roteiro-Melhores-Quintas-compressor-1068x601.jpg']
  },
  {
    id: 'sazonalidade_vindimas_douro',
    category: 'SAZONALIDADE',
    title: 'Vindimas: A Festa do Rio',
    content: `O mês de Setembro transforma a paisagem. O som dos cantares nas encostas e o cheiro a mosto nos lagares. É a alma do Douro em movimento.`,
    imageUrls: ['https://pt.symington.com//img/news/050/image_750_831.jpg']
  },

  // --- QUINTAS ---
  {
    id: 'quinta_roeda_croft',
    category: 'QUINTAS',
    title: 'Quinta da Roêda (Croft)',
    content: `Propriedade icónica da Croft Port. Famosa pelos lagares de granito e vinhas velhas que produzem alguns dos Portos mais finos do mundo.\n\n**Provas:** Disponíveis sob reserva.`,
    imageUrls: ['https://static.portugalbywine.com/media//MULTIMEDIA/FOTOS/2552/15022602656900I_1920.jpg'],
    phone: '+351 254 730 320'
  },
  {
    id: 'quinta_larosa_fam',
    category: 'QUINTAS',
    title: 'Quinta de La Rosa',
    content: `Uma quinta familiar operada pela família Bergqvist. Produção integrada de Porto, DOC Douro e Cerveja Artesanal.\n\n**Restaurante:** Cozinha da Clara é uma referência local.`,
    imageUrls: ['https://static.portugalbywine.com/media//MULTIMEDIA/FOTOS/4808/7235600009706d.jpg'],
    phone: '+351 254 732 254'
  },
  {
    id: 'quinta_bomfim_sym',
    category: 'QUINTAS',
    title: 'Quinta do Bomfim',
    content: `Coração da família Symington no Pinhão. Possui um museu excelente sobre a história da família e da região.`,
    imageUrls: ['https://winetourismtv.sapo.pt/wp-content/uploads/2024/02/Symington_Quinta-do-Bomfim.jpg'],
    phone: '+351 254 730 370'
  },

  // --- RESTAURANTES ---
  {
    id: 'restaurante_cozinha_clara',
    category: 'RESTAURANTES',
    title: 'Cozinha da Clara',
    content: `Um tributo à avó Clara Bergqvist, este restaurante na Quinta de la Rosa combina gastronomia moderna com vistas deslumbrantes sobre o rio. A cozinha foca-se em ingredientes locais e sazonais.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/3b/04/67/cozinha-da-clara.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/37/e0/9b/photo7jpg.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/69/9a/1a/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/3c/59/20/cool-view.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/3e/2d/4f/photo7jpg.jpg?w=1100&h=-1&s=1'
    ],
    phone: '+351 254 732 254',
    website: 'quintadelarosa.com/content/cozinha-da-clara'
  },
  {
    id: 'restaurante_casa_do_arco',
    category: 'RESTAURANTES',
    title: 'Casa Do Arco Restaurante',
    content: `Ambiente rústico e acolhedor, ideal para quem procura a verdadeira essência duriense. Destaque para os pratos de forno e a garrafeira selecionada.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/88/09/c0/casa-do-arco-restaurante.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/88/00/51/sala-do-arco-arco-roam.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/8f/b6/84/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/8f/d8/81/the-grounds-of-the-casa.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 732 505'
  },
  {
    id: 'restaurante_bomfim_1896',
    category: 'RESTAURANTES',
    title: 'Bomfim 1896',
    content: `Cozinha de fogo inspirada nos velhos fornos a lenha do Douro, liderada pelo Chef Pedro Lemos. Localizado na Quinta do Bomfim, oferece uma experiência de fine dining descontraído.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/f7/e0/5e/restaurante-bomfim-1896.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/f7/e0/5f/restaurante-bomfim-1896.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/ec/09/82/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/24/cb/1d/01/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/b4/26/eb/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/20/d1/c8/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/6c/4e/a7/caption.jpg?w=1100&h=-1&s=1'
    ],
    phone: '+351 254 730 370',
    website: 'bomfim1896.pt'
  },
  {
    id: 'restaurante_cardanho_presuntos',
    category: 'RESTAURANTES',
    title: 'Cardanho Dos Presuntos',
    content: `Especialistas em tábuas de presunto, queijos e enchidos regionais. O local perfeito para petiscos acompanhados por vinhos locais.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/a1/9c/a6/presuntos.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/0e/6f/e1/wat-een-fijn-plekje-in.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/33/c0/64/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/42/0e/e6/caption.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 916 597 888'
  },
  {
    id: 'restaurante_writers_place',
    category: 'RESTAURANTES',
    title: 'Writer\'s Place',
    content: `Um espaço de inspiração com uma esplanada agradável. Conhecido pelos seus pratos de carne e ambiente literário relaxado.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/70/13/d2/restaurante.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/51/71/99/a-nossa-entrada.jpg?w=2000&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/ef/91/65/esplanada.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/6b/4d/56/restaurante-writer-s.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 732 315'
  },
  {
    id: 'restaurante_rabelo',
    category: 'RESTAURANTES',
    title: 'Restaurante Rabelo',
    content: `Integrado no Vintage House Hotel, oferece uma cozinha requintada com interpretações modernas de clássicos regionais.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/25/ff/9d/rabelo-restaurant.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/8e/6e/b4/restaurante-rabelo.jpg?w=2000&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/42/83/5e/restaurante-rabelo-rua.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 730 230'
  },
  {
    id: 'restaurante_oporco',
    category: 'RESTAURANTES',
    title: 'O\'porco Wine & Tapas Bar',
    content: `Tapas inovadoras com uma forte seleção de vinhos a copo. Ambiente jovem e descontraído, ideal para partilhar pratos.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/ac/de/f6/onions-at-oporco.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/ac/df/0f/oporco-logo-don-t-miss.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/6d/e5/00/the-shop.jpg?w=900&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/0c/ef/4d/view-to-street.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/6d/e5/39/the-great-wall.jpg?w=1000&h=-1&s=1'
    ],
    phone: '+351 254 732 026'
  },
  {
    id: 'restaurante_imperio',
    category: 'RESTAURANTES',
    title: 'Império - Café',
    content: `Um clássico do Pinhão. Ponto de encontro para locais e turistas, servindo refeições rápidas e cozinha tradicional portuguesa honesta.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/bb/ec/bd/entrance-to-cafe-imperio.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/30/71/28/caption.jpg?w=1200&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/bb/4c/4b/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/38/ad/f2/a-nossa-mota-vespa-de.jpg?w=1000&h=-1&s=1'
    ],
    phone: '+351 254 732 201'
  },
  {
    id: 'restaurante_lbv79',
    category: 'RESTAURANTES',
    title: 'LBV 79',
    content: `Restaurante moderno com uma excelente esplanada no centro. Conhecido pela apresentação cuidada e serviço atencioso.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/60/cc/a9/photo0jpg.jpg?w=2000&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/76/2d/3c/front-view.jpg?w=1200&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/22/be/5e/photo0jpg.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/1e/54/c3/ta-img-20160505-164002.jpg?w=800&h=-1&s=1'
    ],
    phone: '+351 254 738 001'
  },
  {
    id: 'restaurante_rufete',
    category: 'RESTAURANTES',
    title: 'Rufete',
    content: `Localizado junto à estação, é famoso pela rapidez e qualidade dos pratos do dia. Uma opção segura e saborosa.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/03/ad/b0/photo0jpg.jpg?w=2000&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/0a/e4/5d/photo7jpg.jpg?w=2000&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/8f/9b/7e/rufete-restaurante.jpg?w=1000&h=-1&s=1'
    ],
    phone: '+351 254 732 404'
  },
  {
    id: 'restaurante_cais_da_foz',
    category: 'RESTAURANTES',
    title: 'Cais da Foz',
    content: `Localização privilegiada na foz do Rio Pinhão. Especialidades de peixe e marisco com uma vista relaxante sobre a água.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/9d/83/a2/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/35/f0/50/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/a8/05/c3/restaurante-cais-da-foz.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/79/0f/51/de-volta-a-pinhao-e-apos.jpg?w=1100&h=-1&s=1'
    ],
    phone: '+351 254 731 245'
  },
  {
    id: 'restaurante_casa_dos_ecos',
    category: 'RESTAURANTES',
    title: 'Casa Dos Ecos',
    content: `Uma parceria entre a família Symington e o Chef Pedro Lemos. Cozinha tradicional duriense no meio das vinhas da Quinta do Bomfim. Vista panorâmica inigualável.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/74/78/e9/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/86/9b/9a/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/8e/5b/54/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/6f/c4/e5/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/1b/b7/50/img-20201002-011800-largejpg.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/21/4f/48/86/almoco-em-ecos.jpg?w=1100&h=-1&s=1'
    ],
    phone: '+351 254 730 030'
  },
  {
    id: 'restaurante_sabores_do_douro',
    category: 'RESTAURANTES',
    title: 'Sabores Do Douro',
    content: `Restaurante acolhedor com foco nos pratos regionais e vinhos locais. Excelente relação qualidade-preço.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/2e/23/0e/sabores-do-douro.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/47/79/ce/sabores-do-douro.jpg?w=1200&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/2e/22/f5/sabores-do-douro.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/63/99/84/caption.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 732 404'
  },
  {
    id: 'restaurante_taberna_do_rio',
    category: 'RESTAURANTES',
    title: 'Taberna do Rio',
    content: `Um espaço íntimo e moderno. Pratos criativos que respeitam os produtos locais. Ótima carta de vinhos.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/9c/d1/a3/caption.jpg?w=1100&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/ee/11/83/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/32/26/7a/great-restaurant.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 731 236'
  },
  {
    id: 'restaurante_pra_li_bar',
    category: 'RESTAURANTES',
    title: 'Pra Li Bar',
    content: `Bar de tapas animado, ideal para fins de tarde. Boa música, bons petiscos e ambiente vibrante.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/1a/f8/a1/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/8a/f1/47/caption.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 912 345 678'
  },
  {
    id: 'restaurante_vale_tabua',
    category: 'RESTAURANTES',
    title: 'Vale do Tábua Wine & Tapas',
    content: `Focado em vinhos de pequenos produtores e petiscos gourmet. Um lugar para descobrir novos sabores do Douro.`,
    imageUrls: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/0b/e9/04/caption.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/ef/06/62/getlstd-property-photo.jpg?w=1400&h=-1&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/a0/5c/75/caption.jpg?w=1400&h=-1&s=1'
    ],
    phone: '+351 254 732 100'
  },

  // --- MIRADOUROS ---
  {
    id: 'miradouro_casal_loivos_view',
    category: 'MIRADOUROS',
    title: 'Miradouro de Casal de Loivos',
    content: `A vista mais famosa do mundo sobre o Douro, eleita pela BBC. Daqui avista-se o Pinhão e a curva perfeita do rio.`,
    imageUrls: ['https://www.cm-alijo.pt/thumbs/cmalijo/uploads/news/image/1691/dji_0647_1_2500_2500.JPG']
  },
  {
    id: 'miradouro_galafura_torga',
    category: 'MIRADOUROS',
    title: 'São Leonardo de Galafura',
    content: `O "Doiro" de Miguel Torga. Uma altitude impressionante que permite contemplar a imensidão do vale vinhateiro.`,
    imageUrls: ['https://www.roteirododouro.com/wp-content/uploads/MiradouroSaoLeonardoGalafura-2.jpg']
  },
  {
    id: 'miradouro_salvador_mundo',
    category: 'MIRADOUROS',
    title: 'São Salvador do Mundo',
    content: `Vista mística sobre o Cachão da Valeira. Local de romarias e eremitas, com uma perspetiva selvagem do rio.`,
    imageUrls: ['https://www.roteirododouro.com/wp-content/uploads/MiradouroSaoSalvadorDoMundo-1.jpg']
  },
];

export const INITIAL_GUIDES = ['Caria', 'Manuel', 'António', 'Catarina', 'Ricardo Freitas'];
export const PARTNERS = ['Manuel Porto', 'Lamego Hotel', 'Douro Azul', 'Viking River', 'GetYourGuide', 'Viator'];
export const SERVICE_TYPES = ['Passeio de Barco Privado', 'Passeio de Barco Partilhado', 'Sunset Privado', 'Transfer'];
export const INITIAL_GALLERY: GalleryImage[] = [
    { id: 'g1', url: 'https://deltatur.pt/wp-content/uploads/2025/09/DIA-1-FOTOGRAFIAS-27-1024x682.webp', title: 'Douro Lifestyle', category: 'DELTATUR', uploadedBy: 'Admin', date: '2025-05-20' }
];
