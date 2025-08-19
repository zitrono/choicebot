import { motion } from "framer-motion";

interface OverviewProps {
  append: (message: any) => void;
}

export const Overview = ({ append }: OverviewProps) => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => {
                append({
                  role: "user",
                  parts: [{ type: 'text', text: "Parlez-moi en français s'il vous plaît" }],
                });
              }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50 hover:bg-verbier-blue/10 dark:hover:bg-verbier-blue/20 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-2xl">🇫🇷</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 text-center">Demandez-moi<br/>en français</span>
            </button>
            <button 
              onClick={() => {
                append({
                  role: "user",
                  parts: [{ type: 'text', text: "Говорите со мной по-русски, пожалуйста" }],
                });
              }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50 hover:bg-verbier-blue/10 dark:hover:bg-verbier-blue/20 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-2xl">🇷🇺</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 text-center">Спросите меня<br/>по-русски</span>
            </button>
            <button 
              onClick={() => {
                append({
                  role: "user",
                  parts: [{ type: 'text', text: "请用中文和我交谈" }],
                });
              }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50 hover:bg-verbier-blue/10 dark:hover:bg-verbier-blue/20 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-2xl">🇨🇳</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 text-center">用中文<br/>问我</span>
            </button>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};
