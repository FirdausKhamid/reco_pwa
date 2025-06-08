import { useState } from "react";

export default function useFetchExcel() {
  const [excelData, setExcelData] = useState({
    amount: null,
    titlesAndAmounts: [],
  });
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState(null);

  const postExpenseData = async (title, amount, month) => {
    setLoadingPost(true);
    setError(null);

    try {
      const baseUrl = `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_LATEST_SECRET_API_KEY}/exec`;

      const url = `${baseUrl}?action=insertTitleAndAmount&title=${encodeURIComponent(
        title
      )}&amount=${encodeURIComponent(amount)}&month=${encodeURIComponent(
        month
      )}`;

      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to add expense.");
      }

      // Locally update without re-fetch
      setExcelData((prev) => ({
        amount: (parseFloat(prev.amount || 0) - parseFloat(amount)).toFixed(2),
        titlesAndAmounts: [...prev.titlesAndAmounts, { title, amount }],
      }));
    } catch (err) {
      setError(err.message || "Something went wrong while posting.");
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchExcelData = async (month) => {
    setLoadingFetch(true);
    setError(null);

    try {
      const baseUrl = `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_LATEST_SECRET_API_KEY}/exec`;

      const [amountRes, titlesRes] = await Promise.all([
        fetch(`${baseUrl}?action=getAmount&month=${encodeURIComponent(month)}`),
        fetch(
          `${baseUrl}?action=listTitlesAndAmounts&month=${encodeURIComponent(
            month
          )}`
        ),
      ]);

      if (!amountRes.ok || !titlesRes.ok) {
        throw new Error("Failed to fetch one or both endpoints.");
      }

      const amountData = await amountRes.json();
      const titlesData = await titlesRes.json();

      setExcelData({
        amount: amountData?.value ?? null,
        titlesAndAmounts: Array.isArray(titlesData) ? titlesData : [],
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingFetch(false);
    }
  };

  return {
    excelData,
    loadingFetch,
    loadingPost,
    error,
    fetchExcelData,
    postExpenseData,
  };
}
