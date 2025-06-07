import React, { useState } from "react";

export default function useFetchExcel() {
  const [excelData, setExcelData] = useState({
    amount: null,
    titlesAndAmounts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Insert data via GET to avoid CORS preflight (as per updated Apps Script)
  const postExpenseData = async (title, amount, month) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_LATEST_SECRET_API_KEY}/exec`;

      // Build URL with query params, URL-encoded
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

      // re-fetch after successful insert
      await fetchExcelData(month);
    } catch (err) {
      setError(err.message || "Something went wrong while posting.");
    } finally {
      setLoading(false);
    }
  };

  // If you want to keep POST version (may cause CORS issues):
  /*
  const postExpenseDataPost = async (title, amount, month) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_LATEST_SECRET_API_KEY}/exec`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, month }),
        mode: "cors",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to add expense.");
      }

      await fetchExcelData(month);
    } catch (err) {
      setError(err.message || "Something went wrong while posting.");
    } finally {
      setLoading(false);
    }
  };
  */

  const fetchExcelData = async (month) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return { excelData, loading, error, fetchExcelData, postExpenseData };
}
