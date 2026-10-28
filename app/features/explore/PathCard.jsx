import saveIcon from '../../assets/explore/save-icon.svg'
import saveCount from '../../assets/explore/save-count.svg'
import forkCount from '../../assets/explore/fork-count.svg'

/**
 * One community path in the explore grid.
 * @param {object} props
 * @param {string} props.title Path name.
 * @param {string} props.author Creator shown after “By”.
 * @param {string} props.saves Save count, already formatted.
 * @param {string} props.forks Fork count, already formatted.
 * @param {string} props.image Cover image address.
 * @param {number} props.imageWidth Intrinsic cover width.
 * @param {number} props.imageHeight Intrinsic cover height.
 * @param {boolean} [props.cropped] Use the frame’s offset crop instead of a centered cover.
 */
export default function PathCard({
  title,
  author,
  saves,
  forks,
  image,
  imageWidth,
  imageHeight,
  cropped = false,
}) {
  return (
    <article className="flex h-[141px] flex-col gap-2 overflow-hidden border border-[#bcbcbc] bg-white">
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-end bg-[#dad6cd] px-[3px] py-[5px]">
        {cropped ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={image}
              alt=""
              width={imageWidth}
              height={imageHeight}
              className="absolute top-[-64.87%] left-[0.1%] h-[292.29%] w-full max-w-none"
            />
          </div>
        ) : (
          <img
            src={image}
            alt=""
            width={imageWidth}
            height={imageHeight}
            className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
          />
        )}
        <button type="button" aria-label={`Save ${title}`} className="relative z-10 m-0 border-0 bg-transparent p-0 leading-none">
          <img src={saveIcon} alt="" width="24" height="24" className="block" />
        </button>
      </div>
      <div className="flex flex-col gap-1 p-2">
        <h2 className="m-0 text-card-title whitespace-nowrap text-black">{title}</h2>
        <div className="flex items-center justify-between">
          <p className="m-0 text-h5 whitespace-nowrap text-ink">By {author}</p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-0.5">
              <img src={saveCount} alt="" width="12" height="12" className="block" />
              <span className="text-h5 whitespace-nowrap text-ink">{saves}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <img src={forkCount} alt="" width="12" height="12" className="block" />
              <span className="text-h5 whitespace-nowrap text-ink">{forks}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
