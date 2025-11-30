import { useNavigation } from "react-router";
import { useEffect, useState } from "react";

/**
 * Barra de progreso global que se muestra durante navegaciones y mutaciones
 */
export function NavigationProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const isNavigating = navigation.state !== "idle";

  useEffect(() => {
    if (isNavigating) {
      setIsVisible(true);
      setProgress(10);

      // Simular progreso gradual
      const timer1 = setTimeout(() => setProgress(30), 100);
      const timer2 = setTimeout(() => setProgress(60), 300);
      const timer3 = setTimeout(() => setProgress(80), 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // Completar al 100% cuando termina
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Progreso de navegación"
    >
      <div
        className="h-full bg-gradient-to-r from-[#2db3b6] via-[#76b57b] to-[#2db3b6] transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(45, 179, 182, 0.5)",
        }}
      />
    </div>
  );
}
