import { Link } from 'react-router'
import jumpArrow from '../assets/landing/arrow-jump-down.png'

const mission = [
  'The playful design is oriented to inspire free expression to help and motivate people learning and improving in their creative skills without boundaries.',
  'In an age where we are constantly overwhelmed by information and sources, this solution in reality can be a really great tool for many visual and kinesthetic learners even outside the creative fields.',
  'Whether you are beginning with a skill or wish to improve, we want to help you reach your goals and potentially selling your own courses.',
]

const philosophy = [
  'Like a skipping stone touches the clear water multiple times, we believe in the potential for people to propel themselves with the right amount of strenght which is the motivation, the right aim. Being the target and the right propeller, being the people and sources you learn from.',
  'We want you to navigate without obstacles on clear waters.',
  'Our platform is the path to achieving your goals.',
]

const values = ['Development', 'Curiosity', 'Organization', 'Perseverance', 'Encouragement', 'Inspiration']

const poem = [
  'Roads go ever ever on,',
  'Over rock and under tree,',
  'By caves where never sun has shone,',
  'By streams that never find the sea;',
  'Over snow by winter sown,',
  'And through the merry flowers of June,',
  'over grass and over stone,',
  'And under mountains in the moon.',
  '',
  'Roads go ever ever on',
  'Under cloud and under star,',
  'Yet feet that wandering have gone',
  'Turn at last to home afar.',
]

/** The landing page's down arrow, repeated in each corner of the Tolkien quote and rotated to frame it. */
const quoteArrows = [
  { corner: 'top-2 left-2', rotate: '-45deg' },
  { corner: 'top-2 right-2', rotate: '45deg' },
  { corner: 'bottom-2 left-2', rotate: '-135deg' },
  { corner: 'bottom-2 right-2', rotate: '135deg' },
]

/**
 * Our Mission, told from the brand frames and set for a narrow screen.
 * Reads top to bottom as a story: who we are, the mission, the philosophy, the values, then the Tolkien quote.
 */
export default function About() {
  return (
    <div className="landing-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col gap-16 px-4 pt-8 pb-20 font-sans text-ink">
      <header className="flex flex-col items-center gap-6 text-center">
        <Link
          to="/"
          className="!m-0 !inline !border-0 !bg-transparent !p-0 font-sans text-sm leading-body text-quiet !underline"
        >
          Back
        </Link>
        <h1 className="m-0 font-display text-xl leading-heading font-medium tracking-heading">Our Mission</h1>
        <p className="m-0 max-w-[22rem] font-sans text-base leading-body">
          Created by Barbara Borini, Teofil and Omar Caloca, Pathify is dedicated to those serious self-learners.
          The Web App was born from the idea of reuniting all of the learning content from different sources into one source on attractive preset and customizable templates.
        </p>
      </header>

      <section className="flex flex-col gap-8" aria-label="Mission">
        {mission.map((paragraph) => (
          <p key={paragraph} className="m-0 font-sans text-base leading-body">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="philosophy">
        <h2 id="philosophy" className="m-0 text-center font-display text-xl leading-heading font-medium tracking-heading">
          Our Philosophy
        </h2>
        <p className="m-0 text-center font-display text-body">“Let the path guide you far”</p>
        {philosophy.map((paragraph) => (
          <p key={paragraph} className="m-0 font-sans text-base leading-body">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="values">
        <h2 id="values" className="m-0 text-center font-display text-xl leading-heading font-medium tracking-heading">
          Our Values
        </h2>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
          {values.map((value) => (
            <li
              key={value}
              className="flex min-h-16 items-center justify-center rounded-2xl border border-accent-muted bg-white px-3 py-4 text-center font-display text-sm leading-body tracking-wide"
            >
              {value}
            </li>
          ))}
        </ul>
      </section>

      <figure className="relative m-0 rounded-2xl bg-accent-muted px-12 py-14 text-center">
        {quoteArrows.map((arrow) => (
          <span key={arrow.corner} className={`absolute ${arrow.corner}`} style={{ transform: `rotate(${arrow.rotate})` }}>
            <img src={jumpArrow} alt="" width="47" height="38" className="block max-w-none" />
          </span>
        ))}
        <blockquote
          className="m-0 text-[1.0625rem] leading-[1.7] text-ink"
          style={{ fontFamily: 'Bookerly, "Iowan Old Style", Palatino, serif', fontStyle: 'italic' }}
        >
          {poem.map((line, index) => (
            <span key={`${line}-${index}`} className="block">
              {line || '\u00a0'}
            </span>
          ))}
        </blockquote>
        <figcaption className="mt-8 font-display text-base leading-body font-medium">J.R.R. Tolkien</figcaption>
      </figure>
    </div>
  )
}
