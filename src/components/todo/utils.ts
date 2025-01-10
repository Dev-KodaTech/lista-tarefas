export const getCategoryColor = (category: string) => {
  switch (category) {
    case "trabalho":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "pessoal":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "estudos":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "compras":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};