import { useEffect } from 'react';

interface ScrollToTopProps {
  currentPage: string;
}

export default function ScrollToTop({ currentPage }: ScrollToTopProps) {
  useEffect(() => {
    // Scroll to top whenever the page changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [currentPage]);

  return null;
}
