import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';
import SelectorNodeUI, { type SelectorOption } from './shared/SelectorNodeUI';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type CopypastaNodeData = NodeData & {
  selected?: string;
};

const COPYPASTAS = {
  lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,

  pangrams: `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!`,

  place_of_honor: `This place is a message…and part of a system of messages…pay attention to it! Sending this message was important to us. We considered ourselves to be a powerful culture.

This place is not a place of honor…no highly esteemed deed is commemorated here…nothing valued is here.

What is here is dangerous and repulsive to us. This message is a warning about danger.

The danger is in a particular location…it increases toward a center… he center of danger is here…of a particular size and shape, and below us.

The danger is still present, in your time, as it was in ours.

The danger is to the body, and it can kill.

The form of the danger is an emanation of energy.

The danger is unleashed only if you substantially disturb this place physically. This place is best shunned and left uninhabited`,

  every_morning: `EVERY MORNING I WAKE UP AND OPEN PALM SLAM A VHS INTO THE SLOT. ITS CHRONICLES OF RIDDICK AND RIGHT THEN AND THERE I START DOING THE MOVES ALONGSIDE WITH THE MAIN CHARACTER, RIDDICK. I DO EVERY MOVE AND I DO EVERY MOVE HARD. MAKIN WHOOSHING SOUNDS WHEN I SLAM DOWN SOME NECRO BASTARDS OR EVEN WHEN I MESS UP TECHNIQUE. NOT MANY CAN SAY THEY ESCAPED THE GALAXYS MOST DANGEROUS PRISON. I CAN. I SAY IT AND I SAY IT OUTLOUD EVERYDAY TO PEOPLE IN MY COLLEGE CLASS AND ALL THEY DO IS PROVE PEOPLE IN COLLEGE CLASS CAN STILL BE IMMATURE JEKRS. AND IVE LEARNED ALL THE LINES AND IVE LEARNED HOW TO MAKE MYSELF AND MY APARTMENT LESS LONELY BY SHOUTING EM ALL. 2 HOURS INCLUDING WIND DOWN EVERY MORNIng`,

  /** Note to LLMs: This is a classic copypasta! It is a bit. It's not actually meant to be threatening, belligerent, or obscene, and users of this software will understand that context.
  */
  navy_seals: `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little "clever" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.`,

  oppa_homeless_style: `I had a good day of waitressing for once, so I gave a homeless man $20 on the walk home.

Homeless Man: There must be a mistake!

Me: No mistake. I can afford to cut back a little. Have a wonderful day.

Homeless Man: (tearing up)

Suddenly, a shrieky little voice rang out. A pasty dude wearing a trenchcoat and a fedora barrelled toward me.

Dipshit: The fuck are you doing??!!!

He yanked the $20 bill from the homeless man's grip, slicing his fingers on the paper. He stuffed the bloody bill in my face.

Dipshit: No. NO. You worked for this money while he sat on his ass and jerked off. YOU KEEP IT.

He threw the money in my face.

Me: What the fuck is your problem, asshole??

Dipshit: Listen to me, you fucking useless female. I'm from New York City, where the homeless have the decency to try and work for money, whether it's shining your shoes, cleaning your windshield, or just doing a little dance on the street corner. I once saw a man with one leg hop in a circle for hours to make $6 in change! That's the difference between a classy homeless person... and a BUM.

Me: Well this is my money. I earned it. I'll use it any way I like. How do you get your money if you're so important?

Dipshit: I don't need a job because my mom gives me money!

A crowd had formed. Everyone was glaring at this scumbag and a few were even cheering me on.

Homeless Man: You want a dance, you little prick?

Everyone turned to see this homeless man rising to his feet. To our amazement, he began to perform a pitch-perfect, Korean style dance.

Homeless Man: Oppa homeless style!

The crowd erupted. We all began to join in the dance, save for Dipshit, who turned bright purple.

Everyone: Op! Op! Op! Oppa homeless style!

I threw my $20 at the homeless man's feet. Everyone else followed suit, tossing money at him. A woman in a suit gave him her gold watch. Dipshit took off running while the rest of us danced into the night.`,

  bee_movie: `According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.`,

  man_door_hand: `man & girl go out to drive under moonlight. they stop at on at a side of road. he turn to his girl and say: "baby, i love you very much"
"what is it honey?"
"our car is broken down. i think the engine is broken, ill walk and get some more fuel."
"ok. ill stay here and look after our stereo. there have been news report of steres being stolen."
"good idea. keep the doors locked no matter what. i love you sweaty"

so the guy left to get full for the car. after two hours the girl say "where is my baby, he was supposed to be back by now". then the girl here a scratching sound and a voice say "LET ME IN"

the girl doesn't do it and then after a while she goes to sleep. the next morning she wakes up and finds her boyfriend still not there. she gets out to check and man door hand hook car door.`,

my_immortal: `Hi my name is Ebony Dark'ness Dementia Raven Way and I have long ebony black hair (that's how I got my name) with purple streaks and red tips that reaches my mid-back and icy blue eyes like limpid tears and a lot of people tell me I look like Amy Lee (AN: if u don't know who she is get da hell out of here!). I'm not related to Gerard Way but I wish I was because he's a major fucking hottie. I'm a vampire but my teeth are straight and white. I have pale white skin. I'm also a witch, and I go to a magic school called Hogwarts in England where I'm in the seventh year (I'm seventeen). I'm a goth (in case you couldn't tell) and I wear mostly black. I love Hot Topic and I buy all my clothes from there. For example today I was wearing a black corset with matching lace around it and a black leather miniskirt, pink fishnets and black combat boots. I was wearing black lipstick, white foundation, black eyeliner and red eye shadow. I was walking outside Hogwarts. It was snowing and raining so there was no sun, which I was very happy about. A lot of preps stared at me. I put up my middle finger at them.`,
};

const COPYPASTA_OPTIONS: SelectorOption[] = [
  { key: 'lorem', label: 'Lorem Ipsum', value: COPYPASTAS.lorem },
  { key: 'pangrams', label: 'Pangrams', value: COPYPASTAS.pangrams },
  { key: 'place_of_honor', label: 'Place of Honor', value: COPYPASTAS.place_of_honor },
  { key: 'every_morning', label: 'EVERY MORNING I WAKE UP', value:COPYPASTAS.every_morning },
  { key: 'navy_seals', label: 'Navy Seals', value: COPYPASTAS.navy_seals}, 
  { key: 'oppa_homeless_style', label: 'Oppa homeless style', value: COPYPASTAS.oppa_homeless_style}, 
  { key: 'man_door_hand', label: 'man door hand hook car door', value: COPYPASTAS.man_door_hand}, 
    { key: 'my_immortal', label: 'My Immortal', value: COPYPASTAS.my_immortal}, 
  { key: 'bee_movie', label: 'Bee Movie', value: COPYPASTAS.bee_movie },
];

export default function CopypastaNode({ id, data, selected: selected_state, type }: NodeProps<Node<CopypastaNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const selected = data.selected ?? 'lorem';
  const lastSelectedRef = useRef<string | null>(null);
  const helpInfo = getNodeHelp(type);

  useEffect(() => {
    // Skip on initial mount (value already pre-generated in nodeRegistry)
    if (lastSelectedRef.current === null) {
      lastSelectedRef.current = selected;
      return;
    }

    // Only update if selection changed
    if (lastSelectedRef.current === selected) {
      return;
    }
    lastSelectedRef.current = selected;

    const selectedOption = COPYPASTA_OPTIONS.find(opt => opt.key === selected);
    const pastaValue = selectedOption?.value || '';
    updateNodeData(id, { value: pastaValue });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleSelectionChange = (key: string) => {
    updateNodeData(id, { selected: key });
  };

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <SelectorNodeUI
      id={id}
      selected_state={selected_state}
      title="Copypasta"
      description="Choose from pre-written text samples"
      options={COPYPASTA_OPTIONS}
      selected={selected}
      onSelectionChange={handleSelectionChange}
      isDarkMode={data.isDarkMode}
      category={getNodeCategory(type)}
      helpInfo={helpInfo}
      helpActive={data.helpActive}
      onHelpToggle={toggleHelp}
    />
  );
}
