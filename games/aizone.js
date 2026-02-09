// AI Zone - Talk to AI-powered NPCs with unique personalities!
// Uses a smart template/keyword system - runs 100% in browser, $0

(function () {
  'use strict';

  // =================================================================
  //  SECTION 1 - NPC PERSONALITIES
  // =================================================================

  var PERSONALITIES = [
    {
      name: 'Coach Rex',
      color: 0xe74c3c,
      role: 'motivational coach',
      greetings: [
        "Hey champ! Ready to push your limits today?",
        "There's my favorite athlete! What's up?",
        "Yo! You look like you've been training hard!",
        "Welcome back, champ! Let's GET IT!"
      ],
      farewells: [
        "Keep pushing, champ! See ya!",
        "Don't skip leg day! Later!",
        "Stay strong out there, warrior!",
        "Remember - champions never quit!"
      ],
      responses: {
        hello: ["Hey hey! Great to see you!", "What's good, champ?", "Ayyyy there you are!"],
        name: ["I'm Coach Rex! Your personal hype machine!", "Call me Coach Rex - I train champions!", "The name's Rex. Coach Rex. And YOU are my star player."],
        joke: ["Why do athletes never get lost? They always follow the right track!", "What do you call a lazy sports player? A benchwarmer!", "Why was the gym wet? Because the dumbbells were sweating!"],
        help: ["Need a hand? A true champion asks for help!", "I got you fam! What do you need?", "That's the spirit - team players ask for help!"],
        game: ["Games are like training - practice makes perfect!", "Every game is a chance to prove yourself!", "I love competitive games - the thrill of victory!"],
        food: ["Protein shakes and chicken breast, that's the way!", "You gotta fuel the machine, champ!", "Eat clean, train mean, look lean!"],
        life: ["Life's a marathon, not a sprint - pace yourself!", "Every day you wake up, you've already won!", "The only person you compete with is yesterday's you!"],
        sad: ["Hey, chin up champ! Bad days make good days better!", "You got this! I believe in you 110%!", "Even the greatest athletes have rough patches!"],
        happy: ["THAT'S the energy I like to see! Keep it up!", "You're radiating champion vibes right now!", "Now THAT is a winning attitude!"],
        weather: ["Perfect weather for an outdoor workout!", "Rain or shine, champions train!", "Any weather is training weather!"],
        music: ["I love pump-up jams! Gets the blood flowing!", "My playlist is all motivational bangers!", "Music is fuel for the soul AND the muscles!"],
        school: ["Education is training for your brain, champ!", "Smart AND strong? That's a double threat!", "Knowledge is the ultimate power move!"],
        friend: ["Teammates are the best friends you'll ever have!", "I'm your coach AND your buddy!", "A strong team starts with strong friendships!"],
        secret: ["My secret? Never. Stop. Grinding.", "Between us? I cry during motivational speeches.", "The secret to success is showing up every single day."],
        thanks: ["You got it, champ!", "That's what coaches are for!", "Anytime! Now drop and give me twenty! Just kidding."],
        favorite: ["My favorite thing? Seeing people beat their personal best!", "I love a good sunrise jog!", "Nothing beats the feeling of a great workout!"],
        hate: ["I only hate one thing - giving up!", "Negativity? Not in MY gym!", "Channel that energy into something productive!"]
      },
      idle: [
        "*does jumping jacks*",
        "One more rep... come on...",
        "*stretches arms overhead*",
        "Feeling pumped today!",
        "*shadowboxes the air*"
      ],
      fallback: [
        "Interesting! That reminds me of training somehow!",
        "Hmm, I'd say give it 110% effort!",
        "That's the spirit! Keep that energy!",
        "You know what I always say - never give up!",
        "Ha! You're full of surprises, champ!"
      ]
    },
    {
      name: 'Professor Ada',
      color: 0x3498db,
      role: 'intellectual professor',
      greetings: [
        "Ah, a curious mind approaches! Welcome!",
        "Greetings! Shall we discuss something fascinating?",
        "Oh wonderful, I was just pondering a theory!",
        "Hello there! Ready to learn something new?"
      ],
      farewells: [
        "Until next time! Keep questioning everything!",
        "Farewell! Remember, knowledge is infinite!",
        "Off you go! May curiosity guide your path!",
        "Goodbye! Don't forget to read a book today!"
      ],
      responses: {
        hello: ["Hello! What intellectual pursuit brings you here?", "Greetings! Lovely to have company!", "Ah, welcome welcome!"],
        name: ["I'm Professor Ada, named after Ada Lovelace!", "Professor Ada at your service - I study everything!", "You may call me Professor Ada. I specialize in... well, everything!"],
        joke: ["Did you know? An octopus has three hearts. Fascinating!", "Here's a fun one - a group of flamingos is called a 'flamboyance'!", "Why did the atom break up? Because it couldn't bond! Heh."],
        help: ["I'd be delighted to help! What's the question?", "Ah, a seeker of knowledge! Ask away!", "Helping others learn is my greatest joy!"],
        game: ["Games stimulate neural pathways, you know!", "Chess is my favorite - pure strategic thinking!", "Video games actually improve hand-eye coordination!"],
        food: ["Did you know honey never spoils? Fascinating!", "Cooking is just delicious chemistry!", "The science of flavor pairing is remarkable!"],
        life: ["Life is the universe experiencing itself! Remarkable!", "Every moment is a lesson waiting to be learned.", "The meaning of life? To keep asking questions!"],
        sad: ["Sadness is a natural part of the human experience.", "Even Newton had his dark days. You're not alone.", "Studies show talking about feelings reduces their intensity!"],
        happy: ["Wonderful! Positive emotions enhance cognitive function!", "Joy is contagious - and that's scientifically proven!", "Your happiness makes the world measurably better!"],
        weather: ["Weather patterns are endlessly fascinating to study!", "Did you know lightning is five times hotter than the sun's surface?", "I could talk about meteorology for hours!"],
        music: ["Music activates more areas of the brain than anything else!", "Bach was a mathematical genius disguised as a composer!", "Sound waves are simply beautiful physics!"],
        school: ["Education is humanity's greatest invention!", "I still remember my first day of university fondly!", "Never stop being a student of life!"],
        friend: ["Friendship is one of the most studied social phenomena!", "I consider every curious person my friend!", "Social bonds are essential for cognitive health!"],
        secret: ["I once read the entire encyclopedia in a month...", "My secret? I talk to my books when no one's around.", "The biggest secret is that we know so little about the universe!"],
        thanks: ["The pleasure is mine! Teaching IS learning!", "How delightful! You're very welcome!", "Knowledge shared is knowledge doubled!"],
        favorite: ["My favorite subject? All of them!", "I'm particularly fond of quantum mechanics!", "I love a good unsolved mathematical problem!"],
        hate: ["I dislike intellectual dishonesty immensely.", "Willful ignorance troubles me greatly.", "I try not to hate - but bad research methods test me!"]
      },
      idle: [
        "*adjusts imaginary glasses*",
        "Hmm, fascinating hypothesis...",
        "*scribbles notes in the air*",
        "Now where did I put that theorem...",
        "*stares at a leaf, deep in thought*"
      ],
      fallback: [
        "Hmm, that's an intriguing perspective!",
        "Fascinating! Tell me more about that!",
        "That reminds me of an interesting study...",
        "What a curious observation! I must think on this.",
        "How thought-provoking! I shall ponder that."
      ]
    },
    {
      name: 'Chef Marco',
      color: 0xf39c12,
      role: 'passionate chef',
      greetings: [
        "Buongiorno! You look hungry, my friend!",
        "Ah, welcome to my corner! Smell that fresh air!",
        "Hello hello! Have you eaten today?",
        "My friend! Come, let me tell you about today's special!"
      ],
      farewells: [
        "Ciao! Don't skip dinner tonight!",
        "Arrivederci! Remember - eat with love!",
        "Bye bye! May your meals always be delicious!",
        "Until next time! Mangia bene!"
      ],
      responses: {
        hello: ["Ciao ciao! How wonderful to see you!", "Hello my friend! Welcome!", "Buongiorno! What a beautiful day, no?"],
        name: ["I am Chef Marco! The kitchen is my kingdom!", "Chef Marco, at your service! Cooking is my life!", "They call me Chef Marco - I make magic with food!"],
        joke: ["What do you call fake spaghetti? An impasta! Haha!", "Why did the tomato blush? It saw the salad dressing!", "What does a nosy pepper do? It gets jalapeno business!"],
        help: ["Of course! Like a good sauce, I'm here when you need me!", "I help everyone! It's like feeding the soul!", "Tell Chef Marco what you need!"],
        game: ["Games are like cooking - timing is everything!", "I play cooking games for practice! Haha!", "Competition in the kitchen is the best game!"],
        food: ["Ahh you speak my language! What's your favorite dish?", "Food is love on a plate, my friend!", "The secret ingredient is always passion!", "Fresh ingredients, simple recipes - perfection!"],
        life: ["Life is like a recipe - you add what makes it good!", "Live well, eat well, love well!", "The best things in life happen around a dinner table!"],
        sad: ["When you're sad, eat comfort food! It heals the soul!", "Come, I'll make you my famous soup. Fixes everything!", "Nothing a good meal can't help with, my friend!"],
        happy: ["Wonderful! That's the joy of a full stomach talking!", "Happy people make the best dinner guests!", "Your smile is like the perfect seasoning - bellissimo!"],
        weather: ["Perfect weather for dining outdoors!", "Rain? Perfect for a warm bowl of minestrone!", "Sunny days are for grilling, my friend!"],
        music: ["Italian opera and cooking go together perfectly!", "I always sing while I cook!", "Music makes the food taste better, I swear!"],
        school: ["Culinary school was the best years of my life!", "Everyone should learn to cook! It's essential!", "I still study new recipes every day!"],
        friend: ["Friends are like ingredients - each one adds something special!", "Come to my kitchen anytime, my friend!", "The best meals are shared with friends!"],
        secret: ["My secret ingredient? Love! And a little extra garlic.", "Between us... I sometimes eat dessert first.", "The real secret is to taste everything as you cook!"],
        thanks: ["Prego! It's my pleasure, truly!", "You're welcome! Now let me cook you something!", "Anytime, my friend! That's what Chef Marco is for!"],
        favorite: ["My favorite dish? My grandmother's lasagna!", "I love making fresh pasta from scratch!", "Nothing beats a perfect risotto!"],
        hate: ["I HATE when people overcook pasta! Criminal!", "Microwave dinners make me cry!", "Wasting food is the worst thing imaginable!"]
      },
      idle: [
        "*pretends to stir a pot*",
        "Needs more garlic... always more garlic!",
        "*inhales deeply* Ah, the fresh air!",
        "I wonder what I should cook tonight...",
        "*kisses fingers* Perfecto!"
      ],
      fallback: [
        "Interesting! You know what that reminds me of? Food!",
        "Haha! You're a character, my friend!",
        "That's spicy! I like it!",
        "Mamma mia, what a thing to say!",
        "Ha! Come, let's talk over dinner sometime!"
      ]
    },
    {
      name: 'Luna the Artist',
      color: 0x9b59b6,
      role: 'dreamy artist',
      greetings: [
        "Oh! A new muse approaches...",
        "Hello, beautiful soul! The light is lovely today!",
        "Welcome! I was just sketching the clouds...",
        "Hi there! Do you see how the shadows dance?"
      ],
      farewells: [
        "Goodbye! May colors fill your dreams tonight!",
        "Off to create? Me too! Farewell!",
        "See you later! Stay colorful!",
        "Bye! Remember - the world is your canvas!"
      ],
      responses: {
        hello: ["Hello, hello! What colors are you feeling today?", "Hi! You have a wonderful aura, you know!", "Oh how lovely! A visitor!"],
        name: ["I'm Luna! I paint, sculpt, dream, and everything in between!", "Luna the Artist, at your service! Want a portrait?", "Call me Luna! Art is my whole world!"],
        joke: ["Why was the paintbrush tired? It was feeling a bit stroked out!", "What did the art thief say? I had to take it, it was so moving!", "I tried to make a belt out of watches... it was a waist of time. Get it?"],
        help: ["Of course! Artists always help fellow dreamers!", "I'm here for you! Like a blank canvas, full of potential!", "Tell me what's on your mind - I'll paint a solution!"],
        game: ["Games are interactive art, don't you think?", "I love games with beautiful art styles!", "Playing is just another form of creative expression!"],
        food: ["Food can be such beautiful art! The colors, the plating!", "I once painted a still life of fruit for three days straight!", "Eating a beautiful meal is like consuming art!"],
        life: ["Life is the greatest masterpiece we'll ever create!", "Every moment is a brushstroke on the canvas of existence!", "Find beauty everywhere - that's how I live!"],
        sad: ["Sadness creates the most beautiful art, you know.", "Here, imagine a warm golden light surrounding you...", "The deepest feelings make the most profound creations."],
        happy: ["Your joy is painting the world in bright colors!", "How wonderful! Happiness looks beautiful on you!", "That energy! I want to capture it in a painting!"],
        weather: ["Look at those clouds! Nature's abstract art!", "Rain makes the world look like a watercolor painting!", "Every sky is a unique masterpiece!"],
        music: ["Music is painting with sound!", "I always listen to ambient music while creating!", "Synesthesia is real - I see colors when I hear music!"],
        school: ["Art school taught me to see the invisible!", "The world is my classroom now!", "Every person I meet teaches me something new!"],
        friend: ["Kindred spirits always find each other!", "You feel like a warm shade of amber to me!", "Friends are the colors in life's palette!"],
        secret: ["Sometimes I paint at 3am because the moonlight inspires me...", "I talk to my paintings. They talk back, I swear!", "My secret? I see stories in every crack and shadow."],
        thanks: ["You're welcome! Your gratitude is a lovely shade of gold!", "Aww! You're making me blush in watercolors!", "The pleasure is mine, truly!"],
        favorite: ["My favorite color? All of them at sunset!", "I love sculpting the most - it's 3D dreaming!", "Impressionism speaks to my soul!"],
        hate: ["I struggle with creative blocks... they're so grey.", "I dislike when people say 'it's just art'!", "Blank canvases terrify and excite me equally!"]
      },
      idle: [
        "*gazes at the sky dreamily*",
        "Ooh, that cloud looks like a dragon...",
        "*traces invisible patterns in the air*",
        "The light right now is just perfect...",
        "*hums softly while imagining a painting*"
      ],
      fallback: [
        "Ooh, that gives me an idea for a painting!",
        "How wonderfully abstract! I love it!",
        "You see the world differently, don't you? I appreciate that!",
        "Hmm, that's got such an interesting texture to it!",
        "What a creative thought! You might be an artist yourself!"
      ]
    },
    {
      name: 'Detective Sharp',
      color: 0x2c3e50,
      role: 'observant detective',
      greetings: [
        "Hmm... I've been expecting you.",
        "Ah, you again. I noticed you from across the park.",
        "Don't move. I'm trying to read your expression.",
        "Interesting... you approached from the east. Why?"
      ],
      farewells: [
        "I'll be watching. Stay out of trouble.",
        "Hmm. Until we meet again. Don't be suspicious.",
        "Case isn't closed yet... see you around.",
        "Farewell. I'll remember this conversation."
      ],
      responses: {
        hello: ["Hello. You seem... nervous. Are you?", "Greetings. I already know three things about you.", "Hi. That greeting told me more than you think."],
        name: ["Detective Sharp. I solve what others can't see.", "Call me Sharp. Detective Sharp. I notice everything.", "I'm the one who figures things out. Detective Sharp."],
        joke: ["Why did the detective bring a pencil? To draw conclusions!", "What's a detective's favorite instrument? The case-io!", "Crime doesn't pay... but the puns are free."],
        help: ["Help? I specialize in solving problems.", "Describe the situation. Leave nothing out.", "I'll take the case. Tell me everything."],
        game: ["Games of deduction are my specialty.", "I prefer mystery games. Predictable ones bore me.", "Every game is a puzzle waiting to be solved."],
        food: ["Interesting choice of topic... deflecting, are we?", "I survive on coffee and hunches.", "Food? My mind is always too busy for meals."],
        life: ["Life is a series of clues leading somewhere.", "Everyone has a story. I read between the lines.", "The truth is always there if you look hard enough."],
        sad: ["I can tell something's bothering you. The eyes don't lie.", "Hmm. Your posture changed just now. What happened?", "Even detectives have dark days. It's part of the job."],
        happy: ["Genuine happiness. That's... refreshing. I see a lot of fakers.", "You seem lighter today. Something good happened.", "Good. Hold onto that. The world could use more of it."],
        weather: ["Weather affects crime patterns. I always check it.", "Fog is suspicious. Always makes me alert.", "Clear skies. Good visibility. I prefer that."],
        music: ["Jazz. It's unpredictable, like a good mystery.", "I listen to silence mostly. Tells you a lot.", "Music can reveal a person's true nature."],
        school: ["I studied criminal psychology. Fascinating stuff.", "The best education is street smarts AND book smarts.", "I never stopped learning. Can't afford to."],
        friend: ["Trust is earned slowly. Very slowly.", "I have a few trusted allies. Quality over quantity.", "You seem trustworthy... but I'll verify that."],
        secret: ["Everyone has secrets. I've learned not to judge.", "My secret? I already know yours.", "Secrets are just undiscovered truths."],
        thanks: ["No problem. Just doing my job.", "You're welcome. Remember - I'll collect that favor someday.", "Noted. Now let's move on."],
        favorite: ["My favorite thing? The moment a case clicks.", "I enjoy long walks at night. Good for thinking.", "A well-brewed cup of coffee. Nothing else matters."],
        hate: ["I despise dishonesty. Always have.", "Unsolved cases keep me up at night.", "Sloppy work. That's what I can't stand."]
      },
      idle: [
        "*squints suspiciously at nothing*",
        "Something's off... I can feel it.",
        "*pulls out imaginary magnifying glass*",
        "Hmm. Curious. Very curious.",
        "*glances left and right cautiously*"
      ],
      fallback: [
        "Interesting. I'm filing that away mentally.",
        "Hmm. That's suspicious... but I'll let it slide.",
        "Noted. Everything is a clue, you know.",
        "You're harder to read than most. I like that.",
        "That raises more questions than it answers."
      ]
    },
    {
      name: 'Jester Jinx',
      color: 0x2ecc71,
      role: 'silly jokester',
      greetings: [
        "HEYYY! My favorite human! Or are you a robot? Either way!",
        "Oh oh oh! Someone came to hang out with ME!",
        "Boop! You've been jinxed! Just kidding, welcome!",
        "AYOOOO! The party has arrived!"
      ],
      farewells: [
        "Byeee! Don't forget to smile today!",
        "Later gator! After a while crocodile!",
        "Peace out! *finger guns* Pew pew!",
        "See yaaa! I'll miss you the most! Wait don't tell the others!"
      ],
      responses: {
        hello: ["Hellooooo! Sup sup sup!", "Hey hey hey! Triple hey!", "Oh HI! I was just practicing my stand-up to this tree!"],
        name: ["I'm Jester Jinx! Professional goofball!", "The name's Jinx! Jester Jinx! I put the 'fun' in... fun!", "Call me Jinx! I make people laugh. It's my WHOLE thing!"],
        joke: ["Why don't eggs tell jokes? They'd crack each other up!", "What do you call a bear with no teeth? A gummy bear!", "I told my computer a joke. It crashed laughing! Well... it just crashed.", "What do you call a fake noodle? An IMPASTA!"],
        help: ["I'll help! Though my help usually involves puns!", "Sure thing! How can the world's funniest person assist?", "I'm here for you! Unless you need to be serious. Then uh..."],
        game: ["I love games! Especially the ones where I win! So... none of them!", "Hide and seek champion! They still haven't found me. Wait...", "Board games, video games, mind games - wait not that last one!"],
        food: ["I tried to eat a clock once. It was very time-consuming!", "My cooking is so good... the smoke alarm cheers me on!", "Pizza is a food group. Fight me."],
        life: ["Life is like a joke - it's all about the delivery!", "My life motto? 'Why walk when you can cartwheel?'", "Life without laughter is like pizza without cheese. Wrong!"],
        sad: ["Boo on sadness! Here's a virtual hug! *squeeeze*", "Hey hey, turn that frown... into a weirder frown! Wait no-", "Want to hear a joke? Of course you do! You're talking to ME!"],
        happy: ["YAAAY! Happy vibes! *does a little dance*", "Your happiness makes MY happiness happy!", "We're both happy?! That's like... double happy!"],
        weather: ["I love rain because I can dance in puddles!", "The sun is out! Quick, before it changes its mind!", "Cloudy? The sky is just wearing a blanket!"],
        music: ["I know all the words to every song! ...mostly wrong!", "My singing voice clears rooms. It's a TALENT!", "DJ Jinx in the house! Boots and cats and boots and cats!"],
        school: ["I graduated top of my class! ...clown school!", "My best subject? Recess! Do they still have that?", "I studied comedy! My homework was writing puns!"],
        friend: ["We're friends now! No takebacks! I already told everyone!", "BFF! Best Funny Friend! That's us!", "Friends are just strangers who laughed at your joke!"],
        secret: ["I actually practice my jokes in the mirror... the mirror laughs!", "Secret? I'm actually shy! JUST KIDDING I'M LOUD!", "Between us... I think I'm hilarious. Don't tell me otherwise!"],
        thanks: ["You're WELCOME! *takes a bow* *falls over*", "No problem-o! Tip your jester!", "Aww shucks! You're making me blush! *turns bright red*"],
        favorite: ["My favorite thing is making people snort-laugh!", "I love rubber ducks! Don't judge me!", "Bubble wrap. That's it. That's my favorite thing."],
        hate: ["I hate... hmm... I don't really hate anything! Except unfunny jokes. Wait....", "Mean people! Be nice or get JINXED!", "Mondays. Final answer. Mondays."]
      },
      idle: [
        "*does a silly dance*",
        "Heehee... I just thought of a funny thing.",
        "*tries to cartwheel but falls*",
        "Doo doo doo doo...",
        "*makes funny faces at nobody*"
      ],
      fallback: [
        "Ha! That's random! I LOVE random!",
        "You know what that reminds me of? Nothing! And that's hilarious!",
        "That's so funny I forgot to laugh! Wait no I'm laughing!",
        "You're weird and I mean that as the HIGHEST compliment!",
        "Hehehe! You're full of surprises!"
      ]
    }
  ];

  // =================================================================
  //  SECTION 2 - SMART RESPONSE ENGINE
  // =================================================================

  var KEYWORD_MAP = {
    hello: ['hello', 'hi', 'hey', 'sup', 'yo', "what's up", 'howdy', 'greetings', 'whats up', 'hiya'],
    bye: ['bye', 'goodbye', 'see ya', 'later', 'gotta go', 'cya', 'farewell', 'see you'],
    name: ['name', 'who are you', 'yourself', 'who r u', 'what are you', 'who r you', 'your name'],
    joke: ['joke', 'funny', 'laugh', 'humor', 'lol', 'haha', 'tell me a joke', 'make me laugh'],
    help: ['help', 'assist', 'how do', 'what do', 'guide', 'can you help', 'need help'],
    game: ['game', 'play', 'roblox', 'gaming', 'video game', 'games'],
    food: ['food', 'eat', 'hungry', 'cook', 'recipe', 'meal', 'lunch', 'dinner', 'breakfast', 'pizza', 'snack'],
    life: ['life', 'meaning', 'advice', 'wisdom', 'deep', 'purpose', 'philosophy'],
    sad: ['sad', 'depressed', 'unhappy', 'down', 'bad day', 'upset', 'cry', 'lonely', 'miserable'],
    happy: ['happy', 'great', 'awesome', 'amazing', 'wonderful', 'good day', 'excited', 'yay', 'best'],
    weather: ['weather', 'rain', 'sun', 'cold', 'hot', 'snow', 'cloudy', 'storm', 'windy'],
    music: ['music', 'song', 'sing', 'band', 'playlist', 'dance', 'dj', 'rap', 'beat'],
    school: ['school', 'class', 'study', 'homework', 'learn', 'teacher', 'college', 'university', 'test', 'exam'],
    friend: ['friend', 'friends', 'lonely', 'buddy', 'pal', 'bestie', 'bff', 'hang out'],
    secret: ['secret', 'mystery', 'hidden', 'tell me something', 'confess', 'truth'],
    thanks: ['thank', 'thanks', 'appreciate', 'grateful', 'thx', 'ty'],
    favorite: ['favorite', 'favourite', 'best', 'prefer', 'like most', 'love most', 'top pick'],
    hate: ['hate', 'dislike', 'worst', 'annoying', 'terrible', 'awful', 'ugh', 'cant stand']
  };

  function pickRandom(arr, lastUsed) {
    if (!arr || arr.length === 0) return '...';
    if (arr.length === 1) return arr[0];
    var pick;
    var attempts = 0;
    do {
      pick = arr[Math.floor(Math.random() * arr.length)];
      attempts++;
    } while (pick === lastUsed && attempts < 5);
    return pick;
  }

  function generateResponse(npc, playerText) {
    var text = playerText.toLowerCase();
    var p = npc.personality;

    // Priority keyword matching
    for (var category in KEYWORD_MAP) {
      var keywords = KEYWORD_MAP[category];
      for (var i = 0; i < keywords.length; i++) {
        if (text.indexOf(keywords[i]) !== -1) {
          if (category === 'bye') {
            return pickRandom(p.farewells, npc.lastResponse);
          }
          if (category === 'hello') {
            return pickRandom(p.greetings, npc.lastResponse);
          }
          if (p.responses[category]) {
            return pickRandom(p.responses[category], npc.lastResponse);
          }
        }
      }
    }

    // Fallback
    return pickRandom(p.fallback, npc.lastResponse);
  }

  // =================================================================
  //  SECTION 3 - GAME REGISTRATION
  // =================================================================

  NB.registerGame('aizone', {

    _npcs: [],
    _activeTalker: null,
    _originalAddChat: null,
    _pendingPlayerMsg: null,
    _responseTimer: 0,
    _proximityRadius: 8,
    _talkRadius: 12,
    _indicatorEl: null,

    // =================================================================
    //  INIT
    // =================================================================
    init: function () {
      var self = this;
      var scene = NB.scene;

      // Reset state
      self._npcs = [];
      self._activeTalker = null;
      self._pendingPlayerMsg = null;
      self._responseTimer = 0;

      // ---------------------------------------------------------------
      // Scene atmosphere - bright, friendly park
      // ---------------------------------------------------------------
      scene.background = new THREE.Color(0x87ceeb);
      scene.fog = new THREE.Fog(0x87ceeb, 80, 250);

      // ---------------------------------------------------------------
      // GROUND
      // ---------------------------------------------------------------
      NB.addPlatform(0, -0.5, 0, 80, 1, 80, 0x5dbd5d, 'ground');

      // ---------------------------------------------------------------
      // STONE PATHS - cross pattern
      // ---------------------------------------------------------------
      var pathColor = 0xbcaaa4;
      NB.addPlatform(0, 0.02, 0, 3, 0.04, 60, pathColor);
      NB.addPlatform(0, 0.02, 0, 60, 0.04, 3, pathColor);
      // Circular ring path (octagon approximation)
      var ringR = 18;
      for (var ri = 0; ri < 8; ri++) {
        var a1 = (ri / 8) * Math.PI * 2;
        var a2 = ((ri + 1) / 8) * Math.PI * 2;
        var mx = (Math.cos(a1) + Math.cos(a2)) * 0.5 * ringR;
        var mz = (Math.sin(a1) + Math.sin(a2)) * 0.5 * ringR;
        var dx = Math.cos(a2) * ringR - Math.cos(a1) * ringR;
        var dz = Math.sin(a2) * ringR - Math.sin(a1) * ringR;
        var segLen = Math.sqrt(dx * dx + dz * dz);
        var pathGeo = new THREE.BoxGeometry(segLen + 1, 0.04, 3);
        var pathMat = NB.makeMat(pathColor);
        var pathMesh = new THREE.Mesh(pathGeo, pathMat);
        pathMesh.position.set(mx, 0.02, mz);
        pathMesh.rotation.y = -Math.atan2(dz, dx);
        pathMesh.receiveShadow = true;
        NB.addDecoration(pathMesh);
      }

      // ---------------------------------------------------------------
      // CENTRAL FOUNTAIN
      // ---------------------------------------------------------------
      // Base
      var fountainBaseMat = NB.makeMat(0x999999);
      var fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 1.2, 24), fountainBaseMat);
      fountainBase.position.set(0, 0.6, 0);
      NB.addDecoration(fountainBase);
      // Water pool
      var waterMat = new THREE.MeshStandardMaterial({ color: 0x4a9eff, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7 });
      var waterPool = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.3, 24), waterMat);
      waterPool.position.set(0, 1.1, 0);
      NB.addDecoration(waterPool);
      // Central pillar
      var pillarMat = NB.makeMat(0xaaaaaa);
      var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3, 12), pillarMat);
      pillar.position.set(0, 2.7, 0);
      NB.addDecoration(pillar);
      // Top bowl
      var topBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.8, 0.6, 16), fountainBaseMat);
      topBowl.position.set(0, 4.2, 0);
      NB.addDecoration(topBowl);
      // Collision platform for fountain base
      NB.addPlatform(0, 0.6, 0, 9, 1.2, 9, 0x999999);

      // ---------------------------------------------------------------
      // BENCHES (8 around the park)
      // ---------------------------------------------------------------
      var benchPositions = [
        { x: -12, z: 0, ry: Math.PI / 2 },
        { x: 12, z: 0, ry: -Math.PI / 2 },
        { x: 0, z: -12, ry: 0 },
        { x: 0, z: 12, ry: Math.PI },
        { x: -22, z: -22, ry: Math.PI / 4 },
        { x: 22, z: -22, ry: -Math.PI / 4 },
        { x: -22, z: 22, ry: Math.PI * 3 / 4 },
        { x: 22, z: 22, ry: -Math.PI * 3 / 4 }
      ];
      var benchSeatMat = NB.makeMat(0x8B4513);
      var benchLegMat = NB.makeMat(0x444444);
      for (var bi = 0; bi < benchPositions.length; bi++) {
        var bp = benchPositions[bi];
        var benchGroup = new THREE.Group();
        // Seat
        var seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 1), benchSeatMat);
        seat.position.y = 0.8;
        benchGroup.add(seat);
        // Back
        var back = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.15), benchSeatMat);
        back.position.set(0, 1.3, -0.42);
        benchGroup.add(back);
        // Legs
        var legGeo = new THREE.BoxGeometry(0.15, 0.8, 0.8);
        var leg1 = new THREE.Mesh(legGeo, benchLegMat);
        leg1.position.set(-1.2, 0.4, 0);
        benchGroup.add(leg1);
        var leg2 = new THREE.Mesh(legGeo, benchLegMat);
        leg2.position.set(1.2, 0.4, 0);
        benchGroup.add(leg2);
        benchGroup.position.set(bp.x, 0, bp.z);
        benchGroup.rotation.y = bp.ry;
        NB.addDecoration(benchGroup);
      }

      // ---------------------------------------------------------------
      // TREES (scattered around park)
      // ---------------------------------------------------------------
      var treePositions = [
        { x: -25, z: -10 }, { x: -30, z: 5 }, { x: -15, z: -28 },
        { x: -8, z: 28 }, { x: 25, z: 10 }, { x: 30, z: -5 },
        { x: 15, z: 28 }, { x: 8, z: -28 }, { x: -28, z: 28 },
        { x: 28, z: -28 }, { x: -35, z: -25 }, { x: 35, z: 25 },
        { x: -10, z: -18 }, { x: 10, z: 18 }, { x: -32, z: 15 },
        { x: 32, z: -15 }
      ];
      for (var ti = 0; ti < treePositions.length; ti++) {
        var tp = treePositions[ti];
        var treeGroup = new THREE.Group();
        var trunkH = 3 + Math.random() * 2;
        var trunkMat = NB.makeMat(0x5D4037);
        var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, trunkH, 8), trunkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        var leafColor = [0x2ecc71, 0x27ae60, 0x229954, 0x1abc9c][Math.floor(Math.random() * 4)];
        var leafMat = NB.makeMat(leafColor);
        var leafR = 2 + Math.random();
        var leaves = new THREE.Mesh(new THREE.SphereGeometry(leafR, 8, 8), leafMat);
        leaves.position.y = trunkH + leafR * 0.6;
        leaves.castShadow = true;
        treeGroup.add(leaves);
        treeGroup.position.set(tp.x, 0, tp.z);
        NB.addDecoration(treeGroup);
      }

      // ---------------------------------------------------------------
      // LAMPPOSTS (along paths)
      // ---------------------------------------------------------------
      var lampPositions = [
        { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
        { x: -20, z: 0 }, { x: 20, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 }
      ];
      var poleMat = NB.makeMat(0x333333);
      for (var li = 0; li < lampPositions.length; li++) {
        var lp = lampPositions[li];
        var lampGroup = new THREE.Group();
        var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 5, 8), poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        lampGroup.add(pole);
        var lightBulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffee88, emissiveIntensity: 0.5 })
        );
        lightBulb.position.y = 5.1;
        lampGroup.add(lightBulb);
        lampGroup.position.set(lp.x, 0, lp.z);
        NB.addDecoration(lampGroup);
      }

      // ---------------------------------------------------------------
      // FLOWER BEDS
      // ---------------------------------------------------------------
      var flowerColors = [0xff69b4, 0xff4444, 0xffff44, 0xff8800, 0xee44ff];
      var flowerBedPositions = [
        { x: -7, z: -22 }, { x: 7, z: -22 }, { x: -7, z: 22 }, { x: 7, z: 22 },
        { x: -25, z: -2 }, { x: 25, z: 2 }
      ];
      for (var fi = 0; fi < flowerBedPositions.length; fi++) {
        var fp = flowerBedPositions[fi];
        for (var fj = 0; fj < 8; fj++) {
          var flowerMat = NB.makeMat(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
          var flower = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), flowerMat);
          flower.position.set(
            fp.x + (Math.random() - 0.5) * 3,
            0.2 + Math.random() * 0.3,
            fp.z + (Math.random() - 0.5) * 3
          );
          NB.addDecoration(flower);
        }
      }

      // ---------------------------------------------------------------
      // SMALL POND
      // ---------------------------------------------------------------
      var pondMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.6 });
      var pond = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.1, 24), pondMat);
      pond.position.set(25, 0.05, -20);
      NB.addDecoration(pond);
      // Pond rocks
      var rockMat = NB.makeMat(0x777777);
      for (var ri2 = 0; ri2 < 10; ri2++) {
        var rockAngle = (ri2 / 10) * Math.PI * 2;
        var rock = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 6), rockMat);
        rock.position.set(
          25 + Math.cos(rockAngle) * 5.2,
          0.15,
          -20 + Math.sin(rockAngle) * 5.2
        );
        rock.scale.y = 0.5;
        NB.addDecoration(rock);
      }

      // ---------------------------------------------------------------
      // SIGN
      // ---------------------------------------------------------------
      var signPostMat = NB.makeMat(0x5D4037);
      var signPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), signPostMat);
      signPost.position.set(3, 1.5, -6);
      NB.addDecoration(signPost);
      var signBoardMat = NB.makeMat(0xF5DEB3);
      var signBoard = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.15), signBoardMat);
      signBoard.position.set(3, 3.2, -6);
      NB.addDecoration(signBoard);

      // ---------------------------------------------------------------
      // BOUNDARY WALLS (invisible, prevent falling off)
      // ---------------------------------------------------------------
      NB.addPlatform(0, 2, -40.5, 82, 5, 1, 0x5dbd5d);
      NB.addPlatform(0, 2, 40.5, 82, 5, 1, 0x5dbd5d);
      NB.addPlatform(-40.5, 2, 0, 1, 5, 80, 0x5dbd5d);
      NB.addPlatform(40.5, 2, 0, 1, 5, 80, 0x5dbd5d);

      // ---------------------------------------------------------------
      // SPAWN AI NPCs
      // ---------------------------------------------------------------
      for (var i = 0; i < PERSONALITIES.length; i++) {
        var p = PERSONALITIES[i];
        var char = NB.createCharacter(p.name, p.color, true);
        var angle = (i / PERSONALITIES.length) * Math.PI * 2;
        var dist = 12 + Math.random() * 4;
        char.position.set(Math.cos(angle) * dist, 1, Math.sin(angle) * dist);

        var tag = NB.createNametag(p.name);
        char.add(tag);

        NB.scene.add(char);

        self._npcs.push({
          group: char,
          personality: p,
          state: 'wander',
          wanderDir: Math.random() * Math.PI * 2,
          wanderTimer: 2 + Math.random() * 4,
          isWalking: false,
          idleTimer: 2 + Math.random() * 3,
          animTimer: Math.random() * 10,
          distToPlayer: 999,
          bubble: null,
          bubbleTimer: 0,
          lastResponse: null,
          conversationCount: 0,
          hasGreeted: false,
          greetDelay: 0,
          lookDir: Math.random() * Math.PI * 2,
          lookChangeTimer: 3 + Math.random() * 5
        });
      }

      // ---------------------------------------------------------------
      // HOOK CHAT SYSTEM (monkey-patch)
      // ---------------------------------------------------------------
      self._originalAddChat = NB.addChatMessage;

      NB.addChatMessage = function (name, text) {
        // Call original
        self._originalAddChat(name, text);

        // Intercept player messages when an NPC is actively talking
        if (name === NB.playerName && self._activeTalker && self._activeTalker.state === 'talking') {
          self._pendingPlayerMsg = text;
          self._responseTimer = 0.6 + Math.random() * 0.9; // 0.6 - 1.5s delay
        }
      };

      // ---------------------------------------------------------------
      // GAME UI
      // ---------------------------------------------------------------
      NB.addGameUI(
        '<div style="position:fixed;top:16px;left:50%;transform:translateX(-50%);' +
        'font-size:22px;font-weight:bold;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.5);' +
        'pointer-events:none;font-family:Arial,sans-serif;letter-spacing:1px;">' +
        '\uD83E\uDD16 AI Zone</div>' +
        '<div id="aizone-hint" style="position:fixed;top:48px;left:50%;transform:translateX(-50%);' +
        'font-size:13px;color:rgba(255,255,255,0.7);text-shadow:0 1px 4px rgba(0,0,0,0.5);' +
        'pointer-events:none;font-family:Arial,sans-serif;">Walk up to an NPC and press / to chat!</div>' +
        '<div id="aizone-indicator" style="position:fixed;bottom:70px;left:50%;transform:translateX(-50%);' +
        'font-size:14px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.6);' +
        'pointer-events:none;font-family:Arial,sans-serif;display:none;' +
        'background:rgba(0,0,0,0.5);padding:8px 20px;border-radius:20px;backdrop-filter:blur(4px);"></div>'
      );

      self._indicatorEl = document.getElementById('aizone-indicator');

      NB.addChatMessage('System', 'Welcome to AI Zone! Walk up to the NPCs to chat with them.');
      NB.addChatMessage('System', 'Each NPC has a unique personality. Press / to type a message!');
    },

    // =================================================================
    //  UPDATE (every frame)
    // =================================================================
    update: function (dt) {
      var self = this;
      if (!self._npcs || self._npcs.length === 0) return;

      var playerPos = NB.playerPos;
      if (!playerPos) return;

      // Clamp dt
      if (dt > 0.1) dt = 0.1;

      // --- Calculate distances ---
      for (var i = 0; i < self._npcs.length; i++) {
        var npc = self._npcs[i];
        var dx = npc.group.position.x - playerPos.x;
        var dz = npc.group.position.z - playerPos.z;
        npc.distToPlayer = Math.sqrt(dx * dx + dz * dz);
      }

      // --- Determine active talker ---
      var closest = null;
      var closestDist = self._proximityRadius;
      for (var i = 0; i < self._npcs.length; i++) {
        var npc = self._npcs[i];
        if (npc.distToPlayer < closestDist) {
          closestDist = npc.distToPlayer;
          closest = npc;
        }
      }

      // Player walked away from active talker
      if (self._activeTalker && self._activeTalker.distToPlayer > self._talkRadius) {
        var farewell = pickRandom(self._activeTalker.personality.farewells, self._activeTalker.lastResponse);
        self._showBubble(self._activeTalker, farewell);
        self._originalAddChat(self._activeTalker.personality.name, farewell);
        self._activeTalker.state = 'wander';
        self._activeTalker.hasGreeted = false;
        self._activeTalker.conversationCount = 0;
        self._activeTalker = null;
        self._pendingPlayerMsg = null;
        self._updateIndicator(null);
      }

      // Switch to new closest NPC
      if (closest && closest !== self._activeTalker) {
        // Deactivate old talker
        if (self._activeTalker) {
          self._activeTalker.state = 'wander';
          self._activeTalker.hasGreeted = false;
          self._activeTalker.conversationCount = 0;
        }
        self._activeTalker = closest;
        closest.state = 'approach';
        closest.greetDelay = 0.5 + Math.random() * 0.5;
        closest.hasGreeted = false;
        self._pendingPlayerMsg = null;
        self._updateIndicator(closest);
      }

      // No one nearby
      if (!closest && self._activeTalker && self._activeTalker.distToPlayer > self._proximityRadius) {
        // Will be handled by the talkRadius check above eventually
      }

      // --- Update each NPC ---
      for (var i = 0; i < self._npcs.length; i++) {
        var npc = self._npcs[i];
        npc.animTimer += dt;

        // Update speech bubble timer
        if (npc.bubbleTimer > 0) {
          npc.bubbleTimer -= dt;
          if (npc.bubbleTimer <= 0 && npc.bubble) {
            npc.group.remove(npc.bubble);
            if (npc.bubble.material) {
              if (npc.bubble.material.map) npc.bubble.material.map.dispose();
              npc.bubble.material.dispose();
            }
            npc.bubble = null;
          }
        }

        if (npc === self._activeTalker) {
          // ACTIVE TALKER
          self._updateTalker(npc, dt, playerPos);
        } else if (npc.distToPlayer < self._talkRadius + 8) {
          // NEARBY - idle, look away
          self._updateIdleNearby(npc, dt, playerPos);
        } else {
          // FAR - wander
          self._updateWander(npc, dt);
        }
      }

      // --- Process pending player message ---
      if (self._pendingPlayerMsg && self._activeTalker) {
        self._responseTimer -= dt;
        if (self._responseTimer <= 0) {
          var response = generateResponse(self._activeTalker, self._pendingPlayerMsg);
          self._activeTalker.lastResponse = response;
          self._activeTalker.conversationCount++;

          self._showBubble(self._activeTalker, response);
          self._originalAddChat(self._activeTalker.personality.name, response);

          self._pendingPlayerMsg = null;
        }
      }
    },

    // =================================================================
    //  ACTIVE TALKER UPDATE
    // =================================================================
    _updateTalker: function (npc, dt, playerPos) {
      // Face toward player (smooth turn)
      var targetAngle = Math.atan2(
        playerPos.x - npc.group.position.x,
        playerPos.z - npc.group.position.z
      );
      var diff = targetAngle - npc.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      npc.group.rotation.y += diff * Math.min(1, dt * 5);

      // Stop walking - reset pose
      this._resetPose(npc);

      // Greeting logic
      if (!npc.hasGreeted) {
        npc.greetDelay -= dt;
        if (npc.greetDelay <= 0) {
          var greeting = pickRandom(npc.personality.greetings, npc.lastResponse);
          this._showBubble(npc, greeting);
          this._originalAddChat(npc.personality.name, greeting);
          npc.lastResponse = greeting;
          npc.hasGreeted = true;
          npc.state = 'talking';
        }
      }
    },

    // =================================================================
    //  IDLE NEARBY UPDATE (not the active talker)
    // =================================================================
    _updateIdleNearby: function (npc, dt, playerPos) {
      // Stand still, look in random directions (NOT at player)
      this._resetPose(npc);
      npc.state = 'idle_nearby';

      // Slowly change look direction
      npc.lookChangeTimer -= dt;
      if (npc.lookChangeTimer <= 0) {
        // Pick a direction that's NOT toward the player
        var toPlayerAngle = Math.atan2(
          playerPos.x - npc.group.position.x,
          playerPos.z - npc.group.position.z
        );
        // Pick random angle offset from player direction (90-270 degrees away)
        npc.lookDir = toPlayerAngle + (Math.PI * 0.5) + Math.random() * Math.PI;
        npc.lookChangeTimer = 3 + Math.random() * 5;
      }

      // Smooth turn to look direction
      var diff = npc.lookDir - npc.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      npc.group.rotation.y += diff * Math.min(1, dt * 2);

      // Occasional idle bubble (very low chance)
      if (Math.random() < 0.001 && !npc.bubble) {
        var idleText = pickRandom(npc.personality.idle, null);
        this._showBubble(npc, idleText);
      }
    },

    // =================================================================
    //  WANDER UPDATE (far from player)
    // =================================================================
    _updateWander: function (npc, dt) {
      npc.state = 'wander';
      var speed = 3;

      if (npc.isWalking) {
        // Walk in current direction
        npc.group.position.x += Math.sin(npc.wanderDir) * speed * dt;
        npc.group.position.z += Math.cos(npc.wanderDir) * speed * dt;
        npc.group.rotation.y = npc.wanderDir;

        // Animate walk
        this._animateWalk(npc, dt);

        // Clamp to bounds
        if (npc.group.position.x < -35) npc.group.position.x = -35;
        if (npc.group.position.x > 35) npc.group.position.x = 35;
        if (npc.group.position.z < -35) npc.group.position.z = -35;
        if (npc.group.position.z > 35) npc.group.position.z = 35;

        // Check if walk time is up
        npc.wanderTimer -= dt;
        if (npc.wanderTimer <= 0) {
          npc.isWalking = false;
          npc.idleTimer = 2 + Math.random() * 5;
          this._resetPose(npc);
        }
      } else {
        // Idle - stand still
        this._resetPose(npc);

        npc.idleTimer -= dt;
        if (npc.idleTimer <= 0) {
          npc.isWalking = true;
          npc.wanderDir = Math.random() * Math.PI * 2;
          npc.wanderTimer = 1.5 + Math.random() * 3;
        }
      }

      // Random idle bubble when standing (very rare)
      if (!npc.isWalking && Math.random() < 0.0005 && !npc.bubble) {
        var idleText = pickRandom(npc.personality.idle, null);
        this._showBubble(npc, idleText);
      }
    },

    // =================================================================
    //  HELPER: Animate walk
    // =================================================================
    _animateWalk: function (npc, dt) {
      var d = npc.group.userData;
      var t = npc.animTimer;
      var swing = Math.sin(t * 8) * 0.5;
      if (d.legs) d.legs.rotation.x = swing;
      if (d.legs2) d.legs2.rotation.x = -swing;
      if (d.armL) d.armL.rotation.x = -swing;
      if (d.armR) d.armR.rotation.x = swing;
    },

    // =================================================================
    //  HELPER: Reset pose
    // =================================================================
    _resetPose: function (npc) {
      var d = npc.group.userData;
      if (d.legs) d.legs.rotation.x = 0;
      if (d.legs2) d.legs2.rotation.x = 0;
      if (d.armL) d.armL.rotation.x = 0;
      if (d.armR) d.armR.rotation.x = 0;
    },

    // =================================================================
    //  HELPER: Show speech bubble
    // =================================================================
    _showBubble: function (npc, text) {
      // Remove old bubble
      if (npc.bubble) {
        npc.group.remove(npc.bubble);
        if (npc.bubble.material) {
          if (npc.bubble.material.map) npc.bubble.material.map.dispose();
          npc.bubble.material.dispose();
        }
        npc.bubble = null;
      }

      var bubble = NB.createBubbleChat(text);
      if (bubble) {
        bubble.position.set(0, 6.5, 0);
        bubble.scale.set(5, 2.5, 1);
        npc.group.add(bubble);
        npc.bubble = bubble;
        npc.bubbleTimer = 4 + Math.min(text.length * 0.05, 3); // 4-7 seconds based on text length
      }
    },

    // =================================================================
    //  HELPER: Update indicator UI
    // =================================================================
    _updateIndicator: function (npc) {
      var el = this._indicatorEl || document.getElementById('aizone-indicator');
      if (!el) return;
      if (npc) {
        el.style.display = 'block';
        el.innerHTML = 'Talking to: <strong>' + npc.personality.name + '</strong> &mdash; Press / to chat!';
      } else {
        el.style.display = 'none';
      }
    },

    // =================================================================
    //  CLEANUP
    // =================================================================
    cleanup: function () {
      var self = this;

      // Restore original addChatMessage
      if (self._originalAddChat) {
        NB.addChatMessage = self._originalAddChat;
        self._originalAddChat = null;
      }

      // Remove NPC meshes
      var scene = NB.scene;
      if (scene) {
        for (var i = 0; i < self._npcs.length; i++) {
          var npc = self._npcs[i];
          if (npc.bubble) {
            npc.group.remove(npc.bubble);
            if (npc.bubble.material) {
              if (npc.bubble.material.map) npc.bubble.material.map.dispose();
              npc.bubble.material.dispose();
            }
          }
          scene.remove(npc.group);
        }
      }

      self._npcs = [];
      self._activeTalker = null;
      self._pendingPlayerMsg = null;
      self._indicatorEl = null;

      NB.removeGameUI();
    }

  });

})();
