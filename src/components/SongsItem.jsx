import { useContext } from "react"
import { PlayerContext } from "../context/PlayerContext"

function SongsItem({ image, name, desc, id }) {
    const { playWithId } = useContext(PlayerContext);
    return (
        <div
            key={id}
            onClick={() => playWithId(id)}
            className="min-w-[160px] p-4 pb-6 rounded cursor-pointer hover:bg-[#ffffff1a] transition-all duration-200"
        >
            {/* AJUSTES NA IMAGEM AQUI: rounded-md, shadow, aspect-square, object-cover */}
            <img
                className="w-full h-auto rounded-md shadow-lg mb-4 object-cover aspect-square"
                src={image}
                alt={`Capa da música ${name}`}
            />
            <p className="font-bold mt-2 mb-1 text-white truncate">{name}</p>
            <p className="text-slate-400 text-sm line-clamp-2">{desc}</p>
        </div>
    )
}

export default SongsItem