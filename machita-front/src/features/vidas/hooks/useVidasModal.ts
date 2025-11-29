import { useSearchParams, useNavigate, useLocation } from "react-router";

/**
 * Hook para controlar el modal de vidas usando URL search params
 * Aprovecha React Router para mantener el estado en la URL
 *
 * @example
 * const { isOpen, openModal, closeModal } = useVidasModal();
 *
 * // Abrir modal
 * openModal(); // Agrega ?modal=vidas a la URL
 *
 * // Cerrar modal
 * closeModal(); // Remueve ?modal=vidas de la URL
 */
export function useVidasModal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = searchParams.get("modal") === "vidas";

  const openModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("modal", "vidas");
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const closeModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("modal");
    const query = newParams.toString();
    navigate(query ? `?${query}` : location.pathname, { replace: true });
  };

  return {
    isOpen,
    openModal,
    closeModal,
  };
}
