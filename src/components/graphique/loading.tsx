const GraphLoading = () => {
  return (
    <div className="w-full h-full flex flex-row justify-center items-center">
      <div
        id="graphLoadingA"
        className="w-12 h-12 rounded-md bg-secondary/70 opacity-0"
      ></div>
      <div
        id="graphLoadingB"
        className="w-12 h-12 rounded-md bg-secondary/70 mx-7 opacity-0"
      ></div>
      <div
        id="graphLoadingC"
        className="w-12 h-12 rounded-md bg-secondary/70 opacity-0"
      ></div>
    </div>
  );
};

export default GraphLoading;
