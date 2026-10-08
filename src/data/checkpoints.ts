import type { L } from '../i18n';
import type { MediaKey } from './media';
import type { CompanionId } from './companions';

export type CheckpointId = 'nap-ham' | 'bep-hoang-cam' | 'ham-hoi-hop' | 'lo-thong-hoi' | 'gieng-nuoc' | 'ham-quan-y' | 'ho-bom';

export type ArLayer = {
  label: L;
  /** Which overlay to draw for this layer. */
  shape: 'outline' | 'structure' | 'motion' | 'path' | 'people';
};

export type Option = { id: string; text: L; explain: L; best?: boolean };

export type FragmentType = 'photo' | 'sketch' | 'audio' | 'postcard' | 'diagram' | 'object3d';

export type Checkpoint = {
  id: CheckpointId;
  name: L;
  subtitle: L;
  image: MediaKey;
  /** What the camera "sees" when no live camera is available. */
  arScene: MediaKey;
  /** Ghost/structure illustration shown in the AR overlay. */
  arGhost?: MediaKey;
  pastPresent?: { now: MediaKey; then: MediaKey };
  /** Position on the illustrated map, in % of the map size. */
  map: { x: number; y: number };
  distanceM: number;
  walkMin: number;
  expMin: number;
  accessibility: L;
  underground: boolean;
  /** Zone highlighted in the 3D tunnel explorer. */
  zone: string;
  hook: L;
  arLayers: ArLayer[];
  understand: L;
  story: { title: L; narrator: L; text: L };
  companionNotes?: Partial<Record<CompanionId, L>>;
  interact: { prompt: L; options: Option[] };
  reflect: { question: L; quick: L[] };
  fragment: { title: L; type: FragmentType; media: MediaKey; caption: L };
};

export const checkpoints: Checkpoint[] = [
  {
    id: 'nap-ham',
    name: { vi: 'Nắp hầm bí mật', en: 'The secret trapdoor' },
    subtitle: { vi: 'Lối vào nằm ngay dưới lớp lá', en: 'An entrance hidden under the leaves' },
    image: 'siteHatch',
    arScene: 'arLeaves',
    arGhost: 'arHatchOpen',
    pastPresent: { now: 'siteHatch', then: 'arHatchOpen' },
    map: { x: 22, y: 20 },
    distanceM: 0,
    walkMin: 0,
    expMin: 8,
    accessibility: { vi: 'Lối đi bằng phẳng, phù hợp mọi lứa tuổi', en: 'Flat path, suitable for all ages' },
    underground: false,
    zone: 'entrance',
    hook: {
      vi: 'Bạn đang đứng giữa rừng. Xung quanh chỉ có lá khô. Vậy lối vào địa đạo ở đâu?',
      en: 'You are standing in the forest. Only dry leaves around you. So where is the way in?',
    },
    arLayers: [
      { label: { vi: 'Đường viền nắp hầm', en: 'Outline of the trapdoor' }, shape: 'outline' },
      { label: { vi: 'Cấu trúc bên dưới', en: 'Structure underneath' }, shape: 'structure' },
      { label: { vi: 'Cách nắp hầm được mở', en: 'How it opens' }, shape: 'motion' },
      { label: { vi: 'Đường nối vào địa đạo', en: 'Path into the tunnels' }, shape: 'path' },
    ],
    understand: {
      vi: 'Nắp hầm thường chỉ vừa một người lách qua, được phủ đất và lá cây để hòa vào mặt rừng. Miệng hầm nhỏ khiến người lạ khó phát hiện và khó theo vào.',
      en: 'Trapdoors were often just wide enough for one person to squeeze through, covered with soil and leaves to blend into the forest floor. The small opening made them hard to find and hard to follow into.',
    },
    story: {
      title: { vi: 'Biến mất trong ba giây', en: 'Gone in three seconds' },
      narrator: { vi: 'Góc nhìn chiến sĩ liên lạc', en: 'A liaison soldier’s perspective' },
      text: {
        vi: 'Mỗi lần trở về, tôi phải nhớ chính xác gốc cây, mô đất, hướng nắng. Chỉ cần lệch vài bước, lối vào sẽ biến mất giữa lớp lá như chưa từng tồn tại. Sau lưng tôi, lá được phủ lại — và khu rừng lại im lặng như cũ.',
        en: 'Every time I came back I had to remember the exact tree root, mound and angle of the sun. A few steps off and the entrance vanished under the leaves as if it never existed. Behind me the leaves were laid back — and the forest went quiet again.',
      },
    },
    companionNotes: {
      liaison: {
        vi: 'Với người liên lạc, nhớ đường còn quan trọng hơn chạy nhanh.',
        en: 'For a liaison, remembering the way mattered more than running fast.',
      },
    },
    interact: {
      prompt: {
        vi: 'Bạn cần làm một lối vào mà đối phương đi ngang qua cũng không nhận ra. Bạn sẽ làm gì?',
        en: 'You need an entrance that someone could walk right past without noticing. What would you do?',
      },
      options: [
        {
          id: 'a',
          text: { vi: 'Làm cửa lớn để vào ra cho nhanh', en: 'Make a big door to get in and out quickly' },
          explain: {
            vi: 'Cửa lớn dễ bị phát hiện và dễ bị theo vào — người xưa chọn điều ngược lại.',
            en: 'A big door is easy to spot and easy to follow — people chose the opposite.',
          },
        },
        {
          id: 'b',
          text: { vi: 'Làm nắp nhỏ, phủ đất và lá như mặt rừng', en: 'A small lid covered with soil and leaves' },
          explain: {
            vi: 'Đúng là cách người Củ Chi đã làm: nắp nhỏ, ngụy trang kỹ, hòa vào thiên nhiên.',
            en: 'This is what people in Củ Chi did: a small, carefully camouflaged lid that blends into nature.',
          },
          best: true,
        },
        {
          id: 'c',
          text: { vi: 'Đặt lính gác ngay cạnh cửa', en: 'Post a guard next to the door' },
          explain: {
            vi: 'Người gác đứng một chỗ lại chính là dấu hiệu cho biết có lối vào.',
            en: 'A guard standing still is itself a sign that an entrance is there.',
          },
        },
      ],
    },
    reflect: {
      question: {
        vi: 'Nếu đi ngang qua đây mà không có câu chuyện này, bạn có nhận ra lối vào không?',
        en: 'Without this story, would you have noticed the entrance?',
      },
      quick: [
        { vi: 'Chắc chắn không', en: 'Definitely not' },
        { vi: 'Có lẽ là không', en: 'Probably not' },
        { vi: 'Tôi bất ngờ vì nó quá nhỏ', en: 'I’m surprised how small it is' },
      ],
    },
    fragment: {
      title: { vi: 'Nắp hầm bí mật', en: 'Secret trapdoor' },
      type: 'diagram',
      media: 'arHatchOpen',
      caption: { vi: 'Sơ đồ nắp hầm ngụy trang', en: 'Diagram of a camouflaged trapdoor' },
    },
  },
  {
    id: 'bep-hoang-cam',
    name: { vi: 'Bếp Hoàng Cầm', en: 'The Hoàng Cầm kitchen' },
    subtitle: { vi: 'Giữ lửa mà không lộ khói', en: 'Keeping the fire without showing smoke' },
    image: 'siteKitchen',
    arScene: 'arKitchenStove',
    arGhost: 'arKitchenGhost',
    pastPresent: { now: 'siteKitchen', then: 'archiveKitchen' },
    map: { x: 40, y: 34 },
    distanceM: 120,
    walkMin: 3,
    expMin: 10,
    accessibility: { vi: 'Khu trưng bày trên mặt đất, có mái che', en: 'Above-ground covered exhibit' },
    underground: true,
    zone: 'kitchen',
    hook: {
      vi: 'Làm thế nào để nấu ăn cho cả khu căn cứ mà máy bay trinh sát không nhìn thấy khói?',
      en: 'How do you cook for a whole base without spotter planes seeing the smoke?',
    },
    arLayers: [
      { label: { vi: 'Bếp chính', en: 'The main stove' }, shape: 'outline' },
      { label: { vi: 'Ống dẫn khói nhiều ngăn', en: 'Multi-chamber smoke channel' }, shape: 'structure' },
      { label: { vi: 'Khói bị tản ra và nguội dần', en: 'Smoke spreads out and cools' }, shape: 'path' },
      { label: { vi: 'Khói thoát ra xa, mỏng như sương', en: 'It escapes far away, thin as mist' }, shape: 'motion' },
    ],
    understand: {
      vi: 'Bếp Hoàng Cầm mang tên người chiến sĩ nuôi quân Hoàng Cầm, người nghĩ ra kiểu bếp này từ thời kháng chiến chống Pháp. Khói không đi thẳng lên mà được dẫn qua các rãnh ngầm nhiều ngăn, bị chia nhỏ và nguội dần, khi thoát lên mặt đất ở xa chỉ còn là làn khói mỏng như sương sớm.',
      en: 'The kitchen is named after Hoàng Cầm, an army cook who devised this design during the resistance against the French. Instead of rising straight up, smoke is led through branching underground channels where it splits and cools, so by the time it reaches the surface far away it is as thin as morning mist.',
    },
    story: {
      title: { vi: 'Những người giữ lửa', en: 'The keepers of the fire' },
      narrator: { vi: 'Góc nhìn người nấu ăn', en: 'A cook’s perspective' },
      text: {
        vi: 'Một bữa ăn tưởng như đơn giản cũng có thể khiến cả khu căn cứ bị phát hiện. Chúng tôi nhóm lửa từ khi trời còn mờ sương, canh từng làn khói. Nồi cơm chín cũng là lúc mọi người dưới hầm biết: hôm nay vẫn còn được ăn cùng nhau.',
        en: 'A meal that seems simple could give away the whole base. We lit the fire while mist still covered the forest and watched every wisp of smoke. When the rice was ready, everyone below knew: today we still get to eat together.',
      },
    },
    companionNotes: {
      cook: {
        vi: 'Với người nấu ăn, mỗi làn khói là một nỗi lo. Đây là chương của bạn.',
        en: 'For a cook, every wisp of smoke was a worry. This is your chapter.',
      },
    },
    interact: {
      prompt: {
        vi: 'Bạn đang sống tại khu căn cứ năm 1967. Bạn cần nấu ăn nhưng không được để khói làm lộ vị trí. Bạn sẽ chọn cách nào?',
        en: 'It is 1967 and you live at the base. You must cook without letting smoke give away your position. What do you choose?',
      },
      options: [
        {
          id: 'a',
          text: { vi: 'Nấu ngay dưới cửa hầm', en: 'Cook right under the hatch' },
          explain: {
            vi: 'Khói sẽ bốc thẳng lên từ cửa hầm — chỉ dẫn đường cho đối phương.',
            en: 'Smoke would pour straight out of the hatch — a signpost for the enemy.',
          },
        },
        {
          id: 'b',
          text: { vi: 'Dẫn khói qua hệ thống phân tán', en: 'Lead the smoke through a dispersal system' },
          explain: {
            vi: 'Đây chính là bài toán người dưới lòng đất phải giải — và bếp Hoàng Cầm là lời giải.',
            en: 'This was exactly the problem people underground had to solve — and the Hoàng Cầm kitchen was the answer.',
          },
          best: true,
        },
        {
          id: 'c',
          text: { vi: 'Nấu ngoài rừng', en: 'Cook out in the forest' },
          explain: {
            vi: 'Lửa ngoài trời dễ bị trinh sát phát hiện, người nấu cũng phải phơi mình.',
            en: 'An open fire is easy to spot, and the cook is exposed too.',
          },
        },
        {
          id: 'd',
          text: { vi: 'Chỉ nấu vào ban đêm', en: 'Only cook at night' },
          explain: {
            vi: 'Ánh lửa ban đêm còn dễ thấy hơn. Người ta thường nấu lúc sương sớm để khói lẫn vào sương.',
            en: 'Firelight is even more visible at night. People often cooked at dawn so smoke mixed with the mist.',
          },
        },
      ],
    },
    reflect: {
      question: { vi: 'Điều khiến bạn bất ngờ nhất về cuộc sống dưới lòng đất là gì?', en: 'What surprised you most about life underground?' },
      quick: [
        { vi: 'Một bữa ăn cũng là một thử thách', en: 'Even a meal was a challenge' },
        { vi: 'Sự sáng tạo từ những thứ rất đơn giản', en: 'Ingenuity from very simple things' },
        { vi: 'Họ vẫn giữ được nếp sinh hoạt', en: 'They kept everyday life going' },
      ],
    },
    fragment: {
      title: { vi: 'Bếp Hoàng Cầm', en: 'Hoàng Cầm kitchen' },
      type: 'photo',
      media: 'archiveKitchen',
      caption: { vi: 'Bữa cơm dưới lòng đất (tái hiện)', en: 'A meal underground (reconstruction)' },
    },
  },
  {
    id: 'ham-hoi-hop',
    name: { vi: 'Hầm hội họp', en: 'The meeting chamber' },
    subtitle: { vi: 'Những quyết định trong bóng tối', en: 'Decisions made in the dark' },
    image: 'siteMeeting',
    arScene: 'siteMeeting',
    arGhost: 'arMeetingGhost',
    pastPresent: { now: 'siteMeeting', then: 'arMeetingGhost' },
    map: { x: 66, y: 28 },
    distanceM: 90,
    walkMin: 2,
    expMin: 10,
    accessibility: { vi: 'Đoạn hầm thấp, cần cúi người; có lối vòng trên mặt đất', en: 'Low tunnel section, need to crouch; above-ground bypass available' },
    underground: true,
    zone: 'meeting',
    hook: {
      vi: 'Căn phòng nhỏ này từng là nơi bàn những quyết định quan trọng. Ai đã ngồi ở đây?',
      en: 'This small room once hosted important decisions. Who sat here?',
    },
    arLayers: [
      { label: { vi: 'Không gian căn hầm', en: 'The chamber' }, shape: 'outline' },
      { label: { vi: 'Những người đã ngồi ở đây', en: 'The people who sat here' }, shape: 'people' },
      { label: { vi: 'Lối thoát và lỗ thông hơi', en: 'Exits and air vents' }, shape: 'path' },
    ],
    understand: {
      vi: 'Hầm hội họp có trần thấp, ánh sáng từ đèn dầu, được nối với lỗ thông hơi và nhiều lối thoát. Không gian nhỏ buộc mọi người ngồi sát nhau, nói nhỏ và quyết định nhanh.',
      en: 'Meeting chambers had low ceilings, oil-lamp light, air vents and several exits. The cramped space meant people sat close, spoke quietly and decided quickly.',
    },
    story: {
      title: { vi: 'Cuộc họp trong bóng tối', en: 'A meeting in the dark' },
      narrator: { vi: 'Góc nhìn chiến sĩ liên lạc', en: 'A liaison soldier’s perspective' },
      text: {
        vi: 'Ngọn đèn dầu chỉ đủ soi tấm bản đồ. Không ai nói to. Tôi mang tin từ bên ngoài vào, và trước khi đèn tắt, một kế hoạch mới đã thành hình. Rồi mỗi người đi một lối, như chưa từng gặp nhau.',
        en: 'The oil lamp lit only the map. Nobody spoke loudly. I brought news from outside, and before the lamp went out a new plan had taken shape. Then everyone left by a different way, as if we had never met.',
      },
    },
    interact: {
      prompt: {
        vi: 'Cuộc họp đang diễn ra thì có tiếng động phía trên. Điều gì giúp mọi người an toàn nhất?',
        en: 'A noise above interrupts the meeting. What keeps everyone safest?',
      },
      options: [
        {
          id: 'a',
          text: { vi: 'Tất cả chạy ra cùng một cửa', en: 'Everyone runs out the same exit' },
          explain: {
            vi: 'Một lối duy nhất dễ bị chặn. Vì vậy hầm có nhiều lối thoát.',
            en: 'A single exit is easy to block. That is why chambers had several.',
          },
        },
        {
          id: 'b',
          text: { vi: 'Tản ra theo nhiều lối thoát đã chuẩn bị', en: 'Split up through the prepared exits' },
          explain: {
            vi: 'Nhiều lối thoát và sự chuẩn bị trước giúp người trong hầm rời đi an toàn.',
            en: 'Several exits and preparation let people leave safely.',
          },
          best: true,
        },
        {
          id: 'c',
          text: { vi: 'Thắp thêm đèn để nhìn rõ', en: 'Light more lamps to see better' },
          explain: { vi: 'Thêm lửa nghĩa là thêm khói và tốn không khí trong hầm kín.', en: 'More flame means more smoke and less air in a closed chamber.' },
        },
      ],
    },
    reflect: {
      question: { vi: 'Bạn nghĩ cảm giác ngồi họp trong căn hầm này như thế nào?', en: 'How do you think it felt to meet in this chamber?' },
      quick: [
        { vi: 'Ngột ngạt nhưng đoàn kết', en: 'Stifling but united' },
        { vi: 'Căng thẳng từng phút', en: 'Tense every minute' },
        { vi: 'Tôi khâm phục sự bình tĩnh của họ', en: 'I admire their calm' },
      ],
    },
    fragment: {
      title: { vi: 'Hầm hội họp', en: 'Meeting chamber' },
      type: 'sketch',
      media: 'arMeetingGhost',
      caption: { vi: 'Phác hoạ cuộc họp dưới lòng đất', en: 'Sketch of an underground meeting' },
    },
  },
  {
    id: 'lo-thong-hoi',
    name: { vi: 'Lỗ thông hơi', en: 'The air vent' },
    subtitle: { vi: 'Tìm dấu khói trong ụ mối', en: 'A breath hidden in a termite mound' },
    image: 'siteTermite',
    arScene: 'siteTermite',
    map: { x: 78, y: 52 },
    distanceM: 150,
    walkMin: 3,
    expMin: 8,
    accessibility: { vi: 'Lối đi đất, có thể trơn khi mưa', en: 'Dirt path, slippery when wet' },
    underground: false,
    zone: 'vent',
    hook: {
      vi: 'Đây là một ụ mối — hay không chỉ là ụ mối? Hàng trăm người dưới đất thở bằng cách nào?',
      en: 'Is this just a termite mound? How did hundreds of people underground breathe?',
    },
    arLayers: [
      { label: { vi: 'Miệng lỗ thông hơi', en: 'The vent opening' }, shape: 'outline' },
      { label: { vi: 'Ống dẫn khí chạy xiên xuống hầm', en: 'An angled air shaft down to the tunnel' }, shape: 'structure' },
      { label: { vi: 'Luồng khí lưu thông', en: 'Air flowing through' }, shape: 'motion' },
    ],
    understand: {
      vi: 'Nhiều lỗ thông hơi được ngụy trang thành ụ mối hoặc gốc cây. Ống dẫn thường chạy xiên để tránh nước mưa và khó bị nhìn thấu từ trên xuống.',
      en: 'Many air vents were disguised as termite mounds or tree stumps. The shafts often ran at an angle to keep out rain and prevent anyone looking straight down.',
    },
    story: {
      title: { vi: 'Hơi thở của lòng đất', en: 'The breath of the earth' },
      narrator: { vi: 'Góc nhìn người dân địa phương', en: 'A local villager’s perspective' },
      text: {
        vi: 'Ngoài kia người ta chỉ thấy đất và mối. Dưới này, mỗi luồng gió nhỏ là sự sống. Khi trời nóng, cả hầm chờ một làn gió đi qua những ụ đất ấy.',
        en: 'Outside, people saw only soil and termites. Down here, every small draught was life. On hot days the whole tunnel waited for a breeze to pass through those mounds.',
      },
    },
    interact: {
      prompt: { vi: 'Bạn sẽ ngụy trang lỗ thông hơi như thế nào để không ai nghi ngờ?', en: 'How would you disguise an air vent so no one suspects it?' },
      options: [
        {
          id: 'a',
          text: { vi: 'Đục một lỗ tròn thẳng đứng', en: 'Dig a straight vertical hole' },
          explain: { vi: 'Lỗ thẳng dễ nhìn thấu và mưa sẽ chảy thẳng vào hầm.', en: 'A straight hole is easy to see into and lets rain pour in.' },
        },
        {
          id: 'b',
          text: { vi: 'Giấu trong ụ mối, ống dẫn chạy xiên', en: 'Hide it in a termite mound, angled shaft' },
          explain: { vi: 'Đúng vậy — thiên nhiên trở thành lớp ngụy trang tốt nhất.', en: 'Yes — nature became the best camouflage.' },
          best: true,
        },
        {
          id: 'c',
          text: { vi: 'Không cần thông hơi', en: 'No vent needed' },
          explain: { vi: 'Không có thông hơi, không khí trong hầm sẽ nhanh chóng cạn kiệt.', en: 'Without vents the air underground would quickly run out.' },
        },
      ],
    },
    reflect: {
      question: {
        vi: 'Bạn nghĩ mình sẽ bỏ lỡ điều gì nếu chỉ nhìn thấy ụ mối này mà không nghe câu chuyện?',
        en: 'What would you miss if you saw this mound without hearing its story?',
      },
      quick: [
        { vi: 'Sự tinh tế của người xưa', en: 'How clever people were' },
        { vi: 'Rằng mỗi hơi thở đều quý', en: 'That every breath was precious' },
        { vi: 'Tôi sẽ nghĩ đó chỉ là ụ mối', en: 'I’d think it was just a mound' },
      ],
    },
    fragment: {
      title: { vi: 'Lỗ thông hơi', en: 'Air vent' },
      type: 'diagram',
      media: 'siteTermite',
      caption: { vi: 'Ụ mối ngụy trang hệ thống thông gió', en: 'A termite mound hiding the ventilation' },
    },
  },
  {
    id: 'gieng-nuoc',
    name: { vi: 'Giếng nước', en: 'The well' },
    subtitle: { vi: 'Nguồn sống giữa lòng đất', en: 'A source of life underground' },
    image: 'siteWell',
    arScene: 'siteWell',
    map: { x: 54, y: 62 },
    distanceM: 110,
    walkMin: 3,
    expMin: 7,
    accessibility: { vi: 'Có rào chắn an toàn, phù hợp trẻ em', en: 'Safety railing, child friendly' },
    underground: true,
    zone: 'well',
    hook: {
      vi: 'Sống dưới đất nhiều ngày, nước lấy từ đâu khi không thể lên mặt đất?',
      en: 'Living underground for days — where does water come from when you can’t go up?',
    },
    arLayers: [
      { label: { vi: 'Miệng giếng', en: 'The well mouth' }, shape: 'outline' },
      { label: { vi: 'Giếng nối thẳng vào địa đạo', en: 'The well connects to the tunnel' }, shape: 'path' },
    ],
    understand: {
      vi: 'Một số giếng được đào thông với hệ thống địa đạo, giúp người bên dưới có nước dùng mà không phải lộ diện trên mặt đất.',
      en: 'Some wells were dug to connect with the tunnel network, giving people below water without having to show themselves above ground.',
    },
    story: {
      title: { vi: 'Gàu nước đầu tiên', en: 'The first bucket' },
      narrator: { vi: 'Góc nhìn người dân địa phương', en: 'A local villager’s perspective' },
      text: {
        vi: 'Tiếng gàu chạm nước vọng lên trong bóng tối. Ở dưới này, một gàu nước trong là món quà. Chúng tôi chia nhau từng chút, cho người bị thương trước, rồi mới đến mình.',
        en: 'The sound of the bucket touching water echoed in the dark. Down here, a bucket of clean water was a gift. We shared it carefully — the wounded first, then ourselves.',
      },
    },
    interact: {
      prompt: { vi: 'Nước khan hiếm. Bạn ưu tiên dùng cho ai trước?', en: 'Water is scarce. Who gets it first?' },
      options: [
        {
          id: 'a',
          text: { vi: 'Người bị thương', en: 'The wounded' },
          explain: {
            vi: 'Sự sẻ chia và ưu tiên người yếu là điều giữ cộng đồng dưới lòng đất gắn bó.',
            en: 'Sharing and caring for the weakest kept the underground community together.',
          },
          best: true,
        },
        {
          id: 'b',
          text: { vi: 'Người đến trước', en: 'Whoever comes first' },
          explain: {
            vi: 'Trong hoàn cảnh khắc nghiệt, người ta chọn sẻ chia thay vì tranh giành.',
            en: 'In harsh conditions people chose sharing over competing.',
          },
        },
        {
          id: 'c',
          text: { vi: 'Để dành cho nấu ăn', en: 'Save it for cooking' },
          explain: {
            vi: 'Nấu ăn cũng cần nước, nhưng người bị thương thường được ưu tiên.',
            en: 'Cooking needs water too, but the wounded usually came first.',
          },
        },
      ],
    },
    reflect: {
      question: {
        vi: 'Điều gì bạn coi là hiển nhiên hôm nay nhưng là món quà với người dưới hầm?',
        en: 'What do you take for granted that was a gift underground?',
      },
      quick: [
        { vi: 'Nước sạch', en: 'Clean water' },
        { vi: 'Ánh sáng mặt trời', en: 'Sunlight' },
        { vi: 'Không khí trong lành', en: 'Fresh air' },
      ],
    },
    fragment: {
      title: { vi: 'Giếng nước', en: 'The well' },
      type: 'audio',
      media: 'siteWell',
      caption: { vi: 'Âm thanh gàu nước trong lòng đất', en: 'The sound of a bucket underground' },
    },
  },
  {
    id: 'ham-quan-y',
    name: { vi: 'Hầm quân y', en: 'The field clinic' },
    subtitle: { vi: 'Sự sống trong bóng tối', en: 'Life in the darkness' },
    image: 'siteMedical',
    arScene: 'siteMedical',
    map: { x: 30, y: 72 },
    distanceM: 140,
    walkMin: 3,
    expMin: 9,
    accessibility: { vi: 'Đoạn hầm hẹp; có thể xem qua VR tại khu trải nghiệm', en: 'Narrow section; can be viewed in VR at the experience area' },
    underground: true,
    zone: 'clinic',
    hook: {
      vi: 'Không bệnh viện, không điện, thuốc men khan hiếm. Người bị thương được cứu chữa ra sao?',
      en: 'No hospital, no electricity, little medicine. How were the wounded treated?',
    },
    arLayers: [
      { label: { vi: 'Khu chữa trị', en: 'Treatment area' }, shape: 'outline' },
      { label: { vi: 'Người thầy thuốc và người bệnh', en: 'Medic and patient' }, shape: 'people' },
    ],
    understand: {
      vi: 'Các hầm quân y được bố trí sâu và kín, làm việc dưới ánh đèn dầu với dụng cụ tối thiểu. Nhiều ca chữa trị diễn ra trong điều kiện thiếu thốn đến khó tưởng tượng.',
      en: 'Field clinics were set deep and hidden, working by oil-lamp light with minimal tools. Many treatments happened in conditions that are hard to imagine today.',
    },
    story: {
      title: { vi: 'Ngọn đèn không được tắt', en: 'The lamp that must stay lit' },
      narrator: { vi: 'Góc nhìn bác sĩ quân y', en: 'An army medic’s perspective' },
      text: {
        vi: 'Ngọn đèn dầu là thứ quý nhất trong hầm. Tôi học cách làm việc thật nhanh, thật khẽ. Có những đêm, tiếng bom ở trên rất gần — nhưng ở dưới này, tôi chỉ được phép nghĩ đến người đang nằm trước mặt.',
        en: 'The oil lamp was the most precious thing in the tunnel. I learned to work quickly and quietly. Some nights the bombs were very close above — but down here I could only think of the person lying in front of me.',
      },
    },
    companionNotes: {
      medic: { vi: 'Đây là nơi người bác sĩ quân y của bạn đã sống và làm việc.', en: 'This is where your army medic lived and worked.' },
    },
    interact: {
      prompt: { vi: 'Đèn sắp hết dầu giữa ca chữa trị. Bạn sẽ làm gì?', en: 'The lamp is running out of oil mid-treatment. What do you do?' },
      options: [
        {
          id: 'a',
          text: { vi: 'Dừng lại chờ trời sáng', en: 'Stop and wait for daylight' },
          explain: {
            vi: 'Dưới lòng đất không có ánh sáng ban ngày — người thầy thuốc phải xoay xở ngay.',
            en: 'There is no daylight underground — the medic had to manage right away.',
          },
        },
        {
          id: 'b',
          text: { vi: 'Tiết kiệm dầu, làm việc nhanh và phối hợp', en: 'Ration the oil, work fast and as a team' },
          explain: {
            vi: 'Sự phối hợp và tiết kiệm từng thứ nhỏ nhất là cách họ duy trì sự sống.',
            en: 'Teamwork and saving every little thing is how they kept people alive.',
          },
          best: true,
        },
      ],
    },
    reflect: {
      question: { vi: 'Bạn muốn gửi điều gì đến những người thầy thuốc trong lòng đất?', en: 'What would you say to the medics underground?' },
      quick: [
        { vi: 'Cảm ơn', en: 'Thank you' },
        { vi: 'Tôi khâm phục sự kiên cường', en: 'I admire your resilience' },
      ],
    },
    fragment: {
      title: { vi: 'Hầm quân y', en: 'Field clinic' },
      type: 'postcard',
      media: 'siteMedical',
      caption: { vi: 'Bưu thiếp: ngọn đèn trong hầm quân y', en: 'Postcard: the lamp in the field clinic' },
    },
  },
  {
    id: 'ho-bom',
    name: { vi: 'Hố bom B52', en: 'The B-52 crater' },
    subtitle: { vi: 'Đất thép thành đồng', en: 'Land of steel and bronze' },
    image: 'siteBomb',
    arScene: 'siteBomb',
    map: { x: 70, y: 84 },
    distanceM: 200,
    walkMin: 4,
    expMin: 6,
    accessibility: { vi: 'Đường mòn trong rừng cao su, có chỗ nghỉ', en: 'Trail through the rubber forest, rest stops available' },
    underground: false,
    zone: 'crater',
    hook: {
      vi: 'Hố đất khổng lồ này được tạo ra chỉ trong một khoảnh khắc. Vậy người dưới hầm đã vượt qua thế nào?',
      en: 'This huge crater was made in an instant. How did the people below survive?',
    },
    arLayers: [
      { label: { vi: 'Kích thước hố bom', en: 'Size of the crater' }, shape: 'outline' },
      { label: { vi: 'Các tầng hầm sâu bên dưới', en: 'The deep levels below' }, shape: 'structure' },
    ],
    understand: {
      vi: 'Củ Chi từng bị ném bom rải thảm dữ dội. Hệ thống địa đạo nhiều tầng, có đoạn sâu hàng chục mét, giúp người bên dưới trụ lại. Củ Chi được gọi là “đất thép thành đồng”.',
      en: 'Củ Chi was carpet-bombed heavily. The multi-level tunnels, some sections many metres deep, helped people below endure. Củ Chi became known as the “land of steel and bronze”.',
    },
    story: {
      title: { vi: 'Sau tiếng nổ', en: 'After the blast' },
      narrator: { vi: 'Góc nhìn người dân địa phương', en: 'A local villager’s perspective' },
      text: {
        vi: 'Đất rung như muốn sập. Rồi im lặng. Chúng tôi chờ, đếm nhịp thở của nhau. Khi trồi lên, khu rừng đã khác hẳn — nhưng chúng tôi vẫn còn đó, và ngày mai vẫn phải bắt đầu lại.',
        en: 'The earth shook as if it would collapse. Then silence. We waited, counting each other’s breaths. When we came up, the forest was unrecognisable — but we were still there, and tomorrow had to begin again.',
      },
    },
    interact: {
      prompt: { vi: 'Điều gì giúp người dưới hầm an toàn hơn trước bom?', en: 'What made people underground safer from bombing?' },
      options: [
        {
          id: 'a',
          text: { vi: 'Hầm nhiều tầng, đào sâu', en: 'Multiple, deeper levels' },
          explain: {
            vi: 'Địa đạo có nhiều tầng, tầng sâu nhất giúp tránh sức công phá trên mặt đất.',
            en: 'Tunnels had several levels; the deepest helped escape the force above.',
          },
          best: true,
        },
        {
          id: 'b',
          text: { vi: 'Ở gần mặt đất để chạy ra nhanh', en: 'Stay near the surface to run out fast' },
          explain: { vi: 'Gần mặt đất lại là nơi chịu ảnh hưởng mạnh nhất.', en: 'Near the surface is where the impact is strongest.' },
        },
      ],
    },
    reflect: {
      question: { vi: 'Đứng trước hố bom này, bạn nghĩ gì về hòa bình hôm nay?', en: 'Standing before this crater, what do you think about peace today?' },
      quick: [
        { vi: 'Hòa bình thật quý giá', en: 'Peace is precious' },
        { vi: 'Tôi muốn kể lại câu chuyện này', en: 'I want to retell this story' },
      ],
    },
    fragment: {
      title: { vi: 'Hố bom B52', en: 'B-52 crater' },
      type: 'photo',
      media: 'siteBomb',
      caption: { vi: 'Dấu vết chiến tranh trên mặt đất', en: 'Traces of war on the land' },
    },
  },
];

export const checkpointById = Object.fromEntries(checkpoints.map((c) => [c.id, c])) as Record<CheckpointId, Checkpoint>;
