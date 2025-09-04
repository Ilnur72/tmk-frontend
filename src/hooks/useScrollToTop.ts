import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global hook - sahifa o'zgarganda yoki component mount bo'lganda tepaga scroll qiladi
 */
export const useScrollToTop = (dependencies?: any[]) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); // Route o'zgarganda scroll to top

  // Agar dependencies berilgan bo'lsa, ular o'zgarganda ham scroll qiladi
  useEffect(() => {
    if (dependencies && dependencies.length > 0) {
      window.scrollTo(0, 0);
    }
  }, dependencies || []);
};

/**
 * Faqat component mount bo'lganda scroll qiladi
 */
export const useScrollToTopOnMount = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

/**
 * Manual scroll to top function
 */
export const scrollToTop = (behavior: 'auto' | 'smooth' = 'auto') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};