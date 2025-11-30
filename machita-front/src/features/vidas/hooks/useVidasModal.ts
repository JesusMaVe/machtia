import { useSearchParams, useNavigate, useLocation } from "react-router";
import { useCallback } from "react";

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

  const openModal = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("modal", "vidas");
    navigate(`?${newParams.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  const closeModal = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("modal");
    const query = newParams.toString();
    navigate(query ? `?${query}` : location.pathname, { replace: true });
  }, [searchParams, navigate, location.pathname]);

  return {
    isOpen,
    openModal,
    closeModal,
  };
}
