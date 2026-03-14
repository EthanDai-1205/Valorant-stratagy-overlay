const Overlay = ({ children }) => {
  return (
    <div className="overlay-root">
      {children}
      <style jsx>{`
        .overlay-root {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </div>
  );
};

export default Overlay;
