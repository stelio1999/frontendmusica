import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { PlayerContext } from "../context/PlayerContext"

const AlbumItem = ({ image, name, desc, id }) => {
    const navigate = useNavigate();

    return (
        // Define o comportamento do card, hover e navegação ao clicar
        <div
            onClick={() => navigate(`/album/${id}`)}
            className="min-w-[160px] p-4 pb-6 rounded cursor-pointer hover:bg-[#ffffff1a] transition-all duration-200"
        >
            {/* A imagem aqui: w-full faz ocupar a largura do card, h-auto mantém proporção */}
            <img
                className="w-full h-auto rounded-md shadow-lg mb-4 object-cover aspect-square"
                src={image}
                alt={`Capa do álbum ${name}`}
            />
            <p className="font-bold mt-2 mb-1 text-white truncate">{name}</p>
            <p className="text-slate-400 text-sm line-clamp-2">{desc}</p>
        </div>
    );
}

export default AlbumItem;