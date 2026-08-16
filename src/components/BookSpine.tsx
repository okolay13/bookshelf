"use client";

import { Book, STATUS_LABEL } from "@/lib/types";
import { spineStyle, spineTitleFontSize, hashString, SpineDecor } from "@/lib/bookVisuals";
import { parseEmojiTags } from "@/lib/emojiTags";
import { startBookLongPress } from "@/lib/bookDrag";

// Minimal foil-stamp ornaments, drawn in the current (foil) text color so
// the parent's .foil-gold/.foil-silver drop-shadow gives them an embossed
// look. Each is small and centered near the top of the spine, standing in
// for the kind of blind/foil stamping real cloth-bound editions carry.
function FoilDecor({ type }: { type: SpineDecor }) {
  const common = "absolute left-1/2 -translate-x-1/2 pointer-events-none";
  switch (type) {
    case "frame":
      return (
        <span className={`${common} top-2 w-[70%] h-px bg-current opacity-80`} style={{ boxShadow: "0 5px 0 0 currentColor" }} />
      );
    case "doubleFrame":
      return (
        <span className={`${common} top-2 w-[70%] h-px bg-current opacity-80`} style={{ boxShadow: "0 3px 0 0 currentColor, 0 7px 0 0 currentColor" }} />
      );
    case "divider":
      return <span className={`${common} top-1/2 w-[55%] h-px bg-current opacity-70`} />;
    case "star":
      return (
        <svg className={`${common} top-2 w-2.5 h-2.5 opacity-85`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0l2.9 8.1L23 11l-8.1 2.9L12 22l-2.9-8.1L1 11l8.1-2.9z" />
        </svg>
      );
    case "laurel":
      return (
        <svg className={`${common} top-2 w-3.5 h-2.5 opacity-80`} viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 18C6 10 6 4 10 1" strokeLinecap="round" />
          <path d="M30 18C26 10 26 4 22 1" strokeLinecap="round" />
          <path d="M4 15l3-1.5M3 11l3-1M4 7l3-0.5" strokeLinecap="round" />
          <path d="M28 15l-3-1.5M29 11l-3-1M28 7l-3-0.5" strokeLinecap="round" />
        </svg>
      );
    case "emblem":
      return (
        <svg className={`${common} top-2 w-2.5 h-2.5 opacity-85`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" strokeLinecap="round" />
        </svg>
      );
    case "circle":
      return <span className={`${common} top-2 w-2.5 h-2.5 rounded-full border border-current opacity-80`} />;
    case "diamond":
      return <span className={`${common} top-2 w-2 h-2 border border-current opacity-80 rotate-45`} />;
    default:
      return null;
  }
}

export function BookSpine({
  book,
  onClick,
  editable = false,
  shelfName = null,
}: {
  book: Book;
  onClick: () => void;
  // "Edit shelf" mode: enables drag-to-move (mouse HTML5 drag + touch
  // long-press) and the iOS-style jiggle. Outside edit mode the spine is a
  // plain tap target — dragging is off by default so browsing/scrolling the
  // shelf never accidentally moves a book.
  editable?: boolean;
  shelfName?: string | null;
}) {
  const s = spineStyle(book.id || book.title + book.author, { width: book.spine_width });
  const hasImage = Boolean(book.spine_image_url);
  const h = hashString(book.id);
  const wiggleVariant = h % 2 === 0 ? "book-wiggle-a" : "book-wiggle-b";
  const wiggleDelay = (h % 7) * 0.045;
  const titleFontSize = spineTitleFontSize(book.title, s.height, s.width);

  return (
    <span className="relative flex-shrink-0" style={{ width: `${s.width}px` }}>
      <span
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[85%] h-2.5 rounded-full spine-shadow blur-[2px]"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={editable ? undefined : onClick}
        draggable={editable}
        onDragStart={
          editable
            ? (e) => {
                e.dataTransfer.setData("application/x-book-id", book.id);
                e.dataTransfer.effectAllowed = "move";
              }
            : undefined
        }
        onPointerDown={
          editable
            ? (e) => {
                if (e.pointerType === "mouse") return;
                startBookLongPress(
                  { bookId: book.id, fromShelf: shelfName },
                  e.pointerId,
                  { clientX: e.clientX, clientY: e.clientY }
                );
              }
            : undefined
        }
        title={`${book.title} — ${book.author}`}
        style={{
          background: hasImage
            ? `url(${book.spine_image_url}) center/cover`
            : `url(/images/spine-textures/${s.image}) center/64px repeat`,
          height: `${s.height}px`,
          width: `${s.width}px`,
          color: s.text,
          transform: editable ? undefined : `rotate(${s.tilt}deg)`,
          ["--depth-shade" as string]: s.depthShade,
          ["--hue-drift" as string]: `${s.hueDrift}deg`,
          ["--worn-corner" as string]: hasImage ? 0 : s.wornAmount,
          ["--book-tilt" as string]: `${s.tilt}deg`,
          ["--wiggle-delay" as string]: `${wiggleDelay}s`,
          touchAction: editable ? "none" : undefined,
        }}
        className={`group book-spine-btn ${s.worn ? "spine-worn" : ""} relative flex-shrink-0 rounded-t-md rounded-b-sm shadow-[0_4px_8px_rgba(20,11,6,0.4)] border-t border-white/20 transition-[transform,filter] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-glow ${
          editable ? `${wiggleVariant} cursor-grab active:cursor-grabbing` : "hover:-translate-y-1 hover:rotate-0 hover:z-10 cursor-pointer"
        }`}
      >
        {/* cylindrical bevel: bright fold on one edge, soft shade on the other, so spines read as
            rounded, not flat. Kept over cover images too, at nearly full strength — a photo pasted
            flat onto a card was the single biggest reason spines were reading as flat cutouts. */}
        <span
          className="absolute inset-y-0 left-0 w-2/5 pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.22), transparent)", opacity: hasImage ? 0.85 : 1 }}
        />
        <span
          className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
          style={{ background: "linear-gradient(-90deg, rgba(0,0,0,0.7), transparent)", opacity: hasImage ? 0.9 : 1 }}
        />
        {/* soft diagonal sheen across the whole face, multiplied in, standing in for the curve
            catching ambient light along its length rather than just at the two edges */}
        <span
          className="absolute inset-0 pointer-events-none mix-blend-multiply"
          style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.34) 0%, transparent 22%, transparent 58%, rgba(0,0,0,0.28) 100%)" }}
        />
        {!hasImage && s.worn && (
          <span
            className="absolute inset-x-0 top-0 h-6 pointer-events-none opacity-40"
            style={{ background: "linear-gradient(180deg, rgba(255,240,215,0.35), transparent)" }}
          />
        )}
        {/* foreshortened top edge/page-block of the book, seen from slightly above — cream paper
            with faint leaf-lines, not just a flat highlight, is what sells "stack of pages" */}
        <span
          className="page-edge absolute -top-[3px] left-0.5 right-0.5 h-[5px] rounded-t-sm pointer-events-none shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          style={{ transform: "scaleY(0.65)", transformOrigin: "bottom" }}
        />
        {/* foil-stamped ornament — only a minority of spines carry one, see DECOR_CHANCE */}
        {!hasImage && s.decor && (
          <span className={s.foil === "silver" ? "foil-silver" : "foil-gold"}>
            <FoilDecor type={s.decor} />
          </span>
        )}
        {/* contact shadow against the neighbouring spine, so books don't merge into one flat wall of colour */}
        <span className="absolute inset-y-0 -left-px w-px bg-black/35 pointer-events-none" />
        {/* the book resting on the shelf */}
        <span className="absolute -bottom-1 inset-x-0.5 h-1.5 rounded-full bg-black/30 blur-[1px] pointer-events-none" />

        {book.status === "reading" && (
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-glow shadow-[0_0_8px_2px_rgba(255,207,122,0.8)]" />
        )}
        {book.emoji_tag && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm drop-shadow">
            {parseEmojiTags(book.emoji_tag).join(" ")}
          </span>
        )}
        <span
          className="absolute inset-0 flex items-center justify-center px-1"
          style={{ writingMode: "vertical-rl" }}
        >
          <span
            className={`font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis tracking-wide ${
              hasImage
                ? "px-1 py-1.5 rounded bg-espresso-dark/55 text-cream shadow"
                : s.titleFont === "display"
                  ? "font-display"
                  : ""
            }`}
            style={
              hasImage
                ? { fontSize: "11px" }
                : { fontSize: `${titleFontSize}px`, letterSpacing: "0.04em", textShadow: "0 1px 2px var(--book-title-contrast)" }
            }
          >
            {book.title}
          </span>
        </span>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap rounded-md bg-espresso px-2 py-1 text-[11px] text-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-20">
          {book.title}
          <span className="block text-[10px] text-cream/70">{book.author}</span>
        </span>
        <span className="sr-only">{STATUS_LABEL[book.status]}</span>
      </button>
    </span>
  );
}
