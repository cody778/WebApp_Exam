-- Public Explore paths owned by the Pathify account.
-- Before running: create the user pathify@pathify.app in Authentication > Users.
-- Safe to run again: paths and steps keep their ids, so saves, purchases, and progress stay.

insert into public.profiles (id, user_name, full_name)
select id, 'pathify', 'Pathify' from auth.users where email = 'pathify@pathify.app'
on conflict (id) do update set user_name = excluded.user_name, full_name = excluded.full_name;

-- Each step is { "title": ..., "blocks": [...] }. A block line starting with "## " is a heading,
-- "- " a bullet, "1. " a numbered item, "[] " a to-do, and anything else a paragraph.
create or replace function pg_temp.seed_path(
  p_slug text, p_title text, p_description text, p_cover text, p_price numeric, p_materials text[], p_steps jsonb
) returns void language plpgsql as $$
declare
  v_owner uuid := (select id from auth.users where email = 'pathify@pathify.app');
  v_roadmap uuid := md5('pathify-path:' || p_slug)::uuid;
  v_step jsonb;
  v_lesson uuid;
  v_index int := 0;
  v_line text;
  v_position int;
  v_type text;
  v_content jsonb;
begin
  if v_owner is null then
    raise exception 'Create the user pathify@pathify.app in Authentication > Users first.';
  end if;

  insert into public.roadmaps (id, owner_id, title, description, cover_url, price, materials, is_published)
  values (v_roadmap, v_owner, p_title, p_description, p_cover, p_price, p_materials, true)
  on conflict (id) do update set
    title = excluded.title, description = excluded.description, cover_url = excluded.cover_url,
    price = excluded.price, materials = excluded.materials, is_published = true;

  delete from public.roadmap_lessons where roadmap_id = v_roadmap;

  for v_step in select value from jsonb_array_elements(p_steps) loop
    v_lesson := md5('pathify-step:' || p_slug || ':' || v_index)::uuid;
    insert into public.lessons (id, owner_id, title, description, is_published)
    values (v_lesson, v_owner, v_step ->> 'title', '', false)
    on conflict (id) do update set title = excluded.title;

    delete from public.lesson_blocks where lesson_id = v_lesson;
    v_position := 0;
    for v_line in select value from jsonb_array_elements_text(v_step -> 'blocks') loop
      if v_line like '## %' then
        v_type := 'heading';
        v_content := jsonb_build_object('text', substr(v_line, 4), 'level', 2);
      elsif v_line like '- %' then
        v_type := 'paragraph';
        v_content := jsonb_build_object('text', substr(v_line, 3), 'list', 'bulleted');
      elsif v_line ~ '^\d+\. ' then
        v_type := 'paragraph';
        v_content := jsonb_build_object('text', regexp_replace(v_line, '^\d+\. ', ''), 'list', 'numbered');
      elsif v_line like '[] %' then
        v_type := 'paragraph';
        v_content := jsonb_build_object('text', substr(v_line, 4), 'list', 'todo', 'checked', false);
      else
        v_type := 'paragraph';
        v_content := jsonb_build_object('text', v_line);
      end if;
      insert into public.lesson_blocks (id, lesson_id, type, position, content)
      values (gen_random_uuid(), v_lesson, v_type, v_position, v_content);
      v_position := v_position + 1;
    end loop;

    insert into public.roadmap_lessons (roadmap_id, lesson_id, position) values (v_roadmap, v_lesson, v_index);
    v_index := v_index + 1;
  end loop;
end;
$$;

select pg_temp.seed_path('knitting', 'Knitting',
  'Learn to knit from your first cast on to a finished square: the two basic stitches, shaping, and binding off.',
  '/covers/knitting.png', null,
  array['Needles 4.5 mm', 'Sugar n'' Cream cotton yarn 100 g', 'Darning needle', 'Scissors'],
  $json$[
    {"title": "Cast on", "blocks": [
      "Casting on puts the first row of loops on your needle. The long-tail cast on is quick and stretchy.",
      "## Long-tail cast on",
      "1. Pull out a tail about three times the width you want to knit.",
      "2. Make a slip knot and put it on the right needle.",
      "3. Hold the tail over your thumb and the working yarn over your index finger.",
      "4. Scoop under the thumb loop, over the finger yarn, and back through the thumb loop.",
      "5. Drop the thumb loop and tighten. Repeat until you have 20 stitches.",
      "Keep the stitches loose enough to slide along the needle."
    ]},
    {"title": "Knit stitch", "blocks": [
      "The knit stitch is the base of almost every pattern.",
      "1. Hold the needle with stitches in your left hand.",
      "2. Insert the right needle from front to back into the first stitch.",
      "3. Wrap the working yarn around the right needle, counterclockwise.",
      "4. Pull the new loop through and slide the old stitch off the left needle.",
      "Knit every stitch to the end of the row, then swap needles and start again. Knitting every row makes garter stitch."
    ]},
    {"title": "Purl stitch", "blocks": [
      "The purl stitch is the knit stitch seen from the back.",
      "1. Bring the yarn to the front of the work.",
      "2. Insert the right needle from back to front into the first stitch.",
      "3. Wrap the yarn counterclockwise and push the loop out the back.",
      "4. Slide the old stitch off.",
      "Practise one full row of purl, then one row of knit."
    ]},
    {"title": "Stockinette", "blocks": [
      "Stockinette is the smooth fabric of most sweaters: knit one row, purl the next.",
      "- The knit side shows little Vs.",
      "- The purl side shows bumps.",
      "- The edges curl, which is normal.",
      "Knit 10 rows of stockinette and count your rows by the Vs."
    ]},
    {"title": "Increases", "blocks": [
      "Increases add stitches to make the fabric wider.",
      "## Knit front and back (kfb)",
      "Knit into the stitch without dropping it, then knit into the back of the same loop. One stitch becomes two.",
      "[] Work one kfb at the start of a knit row.",
      "[] Count your stitches: you should have one more."
    ]},
    {"title": "Decreases", "blocks": [
      "Decreases remove stitches to shape the fabric.",
      "## Knit two together (k2tog)",
      "Insert the right needle into the next two stitches at once and knit them as one. This leans to the right.",
      "## Slip, slip, knit (ssk)",
      "Slip two stitches one at a time, put them back on the left needle, and knit them together through the back. This leans to the left."
    ]},
    {"title": "Cast off", "blocks": [
      "Casting off locks the last row so it does not unravel.",
      "1. Knit two stitches.",
      "2. Lift the first stitch over the second and off the needle.",
      "3. Knit one more and repeat until one stitch is left.",
      "4. Cut the yarn, pull it through the last loop, and weave in the ends with the darning needle."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('crochet', 'Crochet',
  'Make your first crochet coaster: chains, single crochet, double crochet, and working in the round.',
  '/covers/crochet.png', null,
  array['Crochet hook 4 mm', 'Cotton yarn, medium weight', 'Stitch marker', 'Scissors', 'Tapestry needle'],
  $json$[
    {"title": "Hold the hook and yarn", "blocks": [
      "Hold the hook like a pencil in your dominant hand. Wrap the yarn over the index finger of the other hand to control tension.",
      "Make a slip knot and put it on the hook."
    ]},
    {"title": "Chain stitch", "blocks": [
      "1. Yarn over: wrap the yarn over the hook from back to front.",
      "2. Pull it through the loop on the hook.",
      "Repeat until you have 15 chains. Keep them the same size."
    ]},
    {"title": "Single crochet", "blocks": [
      "1. Insert the hook into the second chain from the hook.",
      "2. Yarn over and pull up a loop. You have two loops.",
      "3. Yarn over and pull through both loops.",
      "Work one single crochet into each chain to finish the row."
    ]},
    {"title": "Double crochet", "blocks": [
      "Double crochet is twice as tall and works up fast.",
      "1. Yarn over, then insert the hook into the stitch.",
      "2. Yarn over and pull up a loop. You have three loops.",
      "3. Yarn over and pull through two loops, twice."
    ]},
    {"title": "Work in the round", "blocks": [
      "Make a magic ring, work 12 double crochet into it, and pull the tail to close the centre.",
      "- Round 2: two stitches in every stitch.",
      "- Round 3: two stitches in every other stitch.",
      "Use the stitch marker to mark the first stitch of each round."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('oil-painting', 'Oleo Painting',
  'Paint a small still life in oils: set up safely, mix colour, block in, and add light.',
  '/covers/oleo.png', null,
  array['Canvas panel 20 x 25 cm', 'Oil paints: titanium white, ultramarine, cadmium yellow, cadmium red, burnt umber', 'Flat and round brushes', 'Odourless solvent', 'Linseed oil', 'Palette and palette knife', 'Rags'],
  $json$[
    {"title": "Set up your space", "blocks": [
      "Work in a ventilated room and keep solvent in a closed jar.",
      "[] Cover your table.",
      "[] Put out a small amount of each colour along the edge of the palette.",
      "[] Keep rags close for wiping brushes."
    ]},
    {"title": "Mix colours", "blocks": [
      "With five colours you can mix almost anything.",
      "- Green: yellow and a touch of ultramarine.",
      "- Orange: yellow and red.",
      "- Greys: ultramarine and burnt umber, lightened with white.",
      "Paint a row of swatches from dark to light for each mix."
    ]},
    {"title": "Block in shapes", "blocks": [
      "Thin burnt umber with solvent and draw the big shapes of your still life.",
      "Fill each shape with its middle tone. Ignore details: you are only placing light against dark."
    ]},
    {"title": "Add light and shadow", "blocks": [
      "Work fat over lean: add a little linseed oil to each new layer so it stays flexible.",
      "Paint the shadows first, then the lights. Save pure white for the brightest highlight."
    ]},
    {"title": "Clean up", "blocks": [
      "Wipe brushes with a rag, rinse them in solvent, then wash with soap and water.",
      "Oil paint dries in days, so leave the painting flat somewhere dust-free."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('sewing', 'Sewing for beginners',
  'Learn the hand and machine basics by sewing a simple drawstring bag.',
  '/covers/sewing.png', null,
  array['Cotton fabric 50 x 40 cm', 'Matching thread', 'Sewing needle', 'Pins', 'Fabric scissors', 'Cord 1 m', 'Safety pin'],
  $json$[
    {"title": "Thread a needle and tie a knot", "blocks": [
      "Cut 50 cm of thread at an angle, push it through the eye, and tie a knot at the long end by wrapping the thread around your finger and rolling it off."
    ]},
    {"title": "Running stitch and backstitch", "blocks": [
      "## Running stitch",
      "Weave the needle in and out in even steps. It is quick and good for gathering.",
      "## Backstitch",
      "Bring the needle up, go back one stitch length, and come up one length ahead. It is strong enough for seams."
    ]},
    {"title": "Cut and pin the bag", "blocks": [
      "1. Fold the fabric in half with the right sides together.",
      "2. Pin along both sides, leaving 5 cm open at the top of each side.",
      "3. Mark a 1 cm seam allowance."
    ]},
    {"title": "Sew the seams", "blocks": [
      "Backstitch along both pinned sides, 1 cm from the edge. Remove pins as you go.",
      "Press the seams open with an iron."
    ]},
    {"title": "Make the drawstring channel", "blocks": [
      "Fold the top edge down 1 cm, then 2 cm, and stitch close to the fold.",
      "Attach the safety pin to the cord and thread it through the channel. Turn the bag right side out."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('digital-drawing', 'Digital drawing',
  'Draw a finished character on a tablet: canvas setup, sketch, line art, flat colour, and shading.',
  '/covers/digital.png', null,
  array['Drawing tablet or iPad', 'Drawing app such as Krita, Procreate, or Clip Studio Paint'],
  $json$[
    {"title": "Set up your canvas", "blocks": [
      "Create a 3000 x 3000 px canvas at 300 DPI. Turn on pressure sensitivity for the brush you use most."
    ]},
    {"title": "Sketch with layers", "blocks": [
      "Sketch loose shapes on one layer at low opacity. Add a new layer for a cleaner second sketch on top.",
      "- Name your layers.",
      "- Lower the opacity of rough sketches."
    ]},
    {"title": "Line art", "blocks": [
      "On a new layer, trace your sketch with a smooth inking brush. Turn on stabilisation for steadier lines.",
      "Vary line weight: thicker on the outside of shapes, thinner inside."
    ]},
    {"title": "Flat colours", "blocks": [
      "Put flat colours on a layer under the line art. Use the fill tool with gap closing, then fix edges with a hard brush."
    ]},
    {"title": "Shading", "blocks": [
      "Add a clipping layer set to Multiply for shadows and one set to Add or Screen for light.",
      "Pick one light source and keep every shadow consistent with it."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('watercolors', 'Watercolors',
  'A complete watercolour course: washes, wet-on-wet, layering, and a finished landscape.',
  '/covers/watercolors.jpg', 4.99,
  array['Watercolour paper 300 g', 'Student watercolour set', 'Round brushes size 4 and 10', 'Two water jars', 'Masking tape', 'Paper towels'],
  $json$[
    {"title": "Tape and prepare paper", "blocks": [
      "Tape the paper on all four sides to a board so it dries flat. Keep one jar for rinsing and one for clean water."
    ]},
    {"title": "Flat and graded washes", "blocks": [
      "## Flat wash",
      "Load the big brush and paint overlapping horizontal strokes, always picking up the wet bead at the bottom.",
      "## Graded wash",
      "Add a little more water to each stroke so the colour fades from dark to light."
    ]},
    {"title": "Wet-on-wet", "blocks": [
      "Wet an area with clean water, then drop colour into it. The paint spreads softly, which is perfect for skies.",
      "Tilt the board to guide the colour."
    ]},
    {"title": "Layering (glazing)", "blocks": [
      "Wait until a layer is completely dry, then paint a transparent layer on top. Work from light to dark: you cannot add white back."
    ]},
    {"title": "Paint a landscape", "blocks": [
      "1. Wet-on-wet sky.",
      "2. Graded wash for distant hills.",
      "3. Darker glaze for the foreground.",
      "4. Small details with the size 4 brush once everything is dry."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('robotics', 'Introduction to Robotics',
  'Build and program a small Arduino robot that drives and avoids obstacles.',
  '/covers/robotics.png', null,
  array['Arduino Uno', 'Breadboard and jumper wires', '2 DC motors with wheels', 'L298N motor driver', 'HC-SR04 distance sensor', 'Battery pack', 'USB cable'],
  $json$[
    {"title": "What a robot is", "blocks": [
      "A robot senses, decides, and acts. In this path the sensor is a distance sensor, the brain is an Arduino, and the motors are the actuators."
    ]},
    {"title": "Blink an LED", "blocks": [
      "Install the Arduino IDE, connect the board, and upload the Blink example. If the built-in LED blinks, your setup works."
    ]},
    {"title": "Drive the motors", "blocks": [
      "Wire both motors to the L298N driver and the driver inputs to Arduino pins 5 to 8.",
      "Write a sketch that drives forward for two seconds, then stops.",
      "Never power motors straight from the Arduino pins."
    ]},
    {"title": "Read the distance sensor", "blocks": [
      "Connect the HC-SR04 trigger and echo pins, send a pulse, and convert the echo time to centimetres. Print it in the Serial Monitor."
    ]},
    {"title": "Avoid obstacles", "blocks": [
      "Combine both parts: drive forward, and when the distance is under 20 cm, stop, turn for half a second, and continue.",
      "[] Test on the floor.",
      "[] Tune the distance and turn time."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('plant-care', 'Plant care for beginners',
  'Keep houseplants alive and growing: light, water, soil, repotting, and common problems.',
  '/covers/plants.jpg', null,
  array['A houseplant', 'Pot with drainage hole', 'Indoor potting mix', 'Watering can', 'Spray bottle'],
  $json$[
    {"title": "Know your light", "blocks": [
      "Check where the light comes from. South windows are brightest, north windows are gentle.",
      "- Bright, indirect: monstera, pothos, ficus.",
      "- Low light: snake plant, ZZ plant."
    ]},
    {"title": "Water the right way", "blocks": [
      "Push a finger 2 cm into the soil. Water only when it feels dry, and water until it runs out of the drainage hole.",
      "Overwatering kills more plants than underwatering."
    ]},
    {"title": "Soil and repotting", "blocks": [
      "Repot in spring when roots circle the pot. Choose a pot only 2 to 3 cm wider and use fresh potting mix."
    ]},
    {"title": "Solve common problems", "blocks": [
      "- Yellow leaves: usually too much water.",
      "- Brown, crispy tips: dry air or too little water.",
      "- Leggy stems: not enough light."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('landscape', 'Landscape photography',
  'Plan, compose, and edit landscape photos that feel as big as the place you were standing in.',
  '/covers/landscape.jpg', 6.99,
  array['Camera or phone with manual mode', 'Tripod', 'Wide-angle lens (optional)', 'Editing app such as Lightroom or Snapseed'],
  $json$[
    {"title": "Plan around the light", "blocks": [
      "The best light is in the hour after sunrise and before sunset. Check sunrise times and the weather the day before."
    ]},
    {"title": "Composition", "blocks": [
      "- Put the horizon on a third, not in the middle.",
      "- Add something in the foreground to give depth.",
      "- Use paths, rivers, and fences as leading lines."
    ]},
    {"title": "Exposure settings", "blocks": [
      "Start at ISO 100, f/8 to f/11 for sharpness front to back, and adjust the shutter speed until the histogram is not clipped.",
      "Use the tripod and a two-second timer to avoid shake."
    ]},
    {"title": "Edit your photo", "blocks": [
      "1. Straighten the horizon and crop.",
      "2. Recover highlights and lift shadows.",
      "3. Adjust white balance.",
      "4. Add a little contrast and stop before it looks fake."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('blender', '3D modeling with Blender',
  'Model, light, and render a coffee mug in Blender, from the interface to your first final image.',
  '/covers/blender.jpg', 9.99,
  array['Computer with a three-button mouse', 'Blender (free download)'],
  $json$[
    {"title": "Find your way around", "blocks": [
      "- Middle mouse: orbit. Shift + middle mouse: pan. Scroll: zoom.",
      "- Tab switches between Object and Edit mode.",
      "- G moves, R rotates, S scales."
    ]},
    {"title": "Model the mug body", "blocks": [
      "Add a cylinder, delete the top face, and extrude the rim inwards and down to give the mug thickness.",
      "Add a Subdivision Surface modifier and loop cuts near the edges to keep them crisp."
    ]},
    {"title": "Add the handle", "blocks": [
      "Select two faces on the side, extrude them out, and bend the handle back into the body with a few more extrusions. Bridge the ends."
    ]},
    {"title": "Materials", "blocks": [
      "Give the mug a Principled BSDF material with a glossy colour, and add a darker material for the coffee inside."
    ]},
    {"title": "Light and render", "blocks": [
      "Add an area light at an angle, place the camera, and render with Cycles at 128 samples. Save the image from the render window."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('sashiko', 'Sashiko',
  'Japanese running-stitch embroidery: transfer a pattern and stitch your first geometric design.',
  '/covers/sashiko.jpg', null,
  array['Sashiko needle', 'Sashiko fabric', 'Sashiko thread', 'Sashiko pattern'],
  $json$[
    {"title": "What is Sashiko", "blocks": [
      "Sashiko means little stabs. It started as a way to mend and reinforce clothes and became a decorative craft of even running stitches in geometric patterns."
    ]},
    {"title": "Transfer or draw the pattern", "blocks": [
      "Trace the pattern onto the fabric with a water-soluble pen, or draw a grid and build the pattern from it.",
      "Keep lines straight: the beauty of Sashiko is in its regularity."
    ]},
    {"title": "Thread and start", "blocks": [
      "Cut a long thread, tie a small knot, and start from the back so the knot is hidden."
    ]},
    {"title": "Even running stitches", "blocks": [
      "Load several stitches on the needle at once, then pull through. Aim for stitches about twice as long as the gaps.",
      "Leave a little slack at each turn so the fabric does not pucker."
    ]},
    {"title": "Corners and crossings", "blocks": [
      "Never cross stitches at a corner or intersection. Leave the meeting point open so the pattern reads clearly."
    ]},
    {"title": "Finish", "blocks": [
      "End on the back with a small knot, then wash out the pen marks and press the fabric."
    ]}
  ]$json$::jsonb);

select pg_temp.seed_path('embroidery', 'Embroidery',
  'Twelve essential embroidery stitches and a small floral hoop to put them together.',
  '/covers/embroidery.jpg', 5.99,
  array['Embroidery hoop 15 cm', 'Cotton fabric', 'Stranded embroidery floss', 'Embroidery needle', 'Water-soluble pen', 'Small scissors'],
  $json$[
    {"title": "Set up the hoop", "blocks": [
      "Loosen the outer ring, place the fabric over the inner ring, and tighten until the fabric sounds like a drum."
    ]},
    {"title": "Separate floss", "blocks": [
      "Stranded floss has six strands. Pull out two or three one at a time for fine work."
    ]},
    {"title": "Outline stitches", "blocks": [
      "- Backstitch for clean lines.",
      "- Stem stitch for curved stems.",
      "- Split stitch for textured outlines."
    ]},
    {"title": "Fill stitches", "blocks": [
      "Satin stitch fills small shapes with straight, parallel stitches. Outline the shape first with split stitch for a raised edge."
    ]},
    {"title": "Decorative stitches", "blocks": [
      "- French knots for flower centres.",
      "- Lazy daisy for petals.",
      "- Woven wheel for roses."
    ]},
    {"title": "Stitch the floral hoop", "blocks": [
      "Transfer the design, stitch stems first, then leaves, then flowers. Finish the back by gathering the fabric with a running stitch."
    ]}
  ]$json$::jsonb);
