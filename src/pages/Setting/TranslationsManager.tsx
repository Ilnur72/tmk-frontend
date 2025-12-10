import React, { useMemo, useState } from "react";
import en from "../../locales/en/translation.json";
import ru from "../../locales/ru/translation.json";
import uz from "../../locales/uz/translation.json";
import i18n from "../../i18n";

type Lang = "en" | "ru" | "uz";

function flatten(obj: any, prefix = "") {
  const res: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(res, flatten(val, nextKey));
    } else {
      res[nextKey] = val;
    }
  }
  return res;
}

function unflatten(map: Record<string, any>) {
  const res: any = {};
  for (const flatKey of Object.keys(map)) {
    const parts = flatKey.split(".");
    let cur = res;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        cur[p] = map[flatKey];
      } else {
        cur[p] = cur[p] || {};
        cur = cur[p];
      }
    }
  }
  return res;
}

const initial = {
  en: flatten(en),
  ru: flatten(ru),
  uz: flatten(uz),
};

const TranslationsManager: React.FC = () => {
  const [data, setData] =
    useState<Record<Lang, Record<string, string>>>(initial);
  const [newKey, setNewKey] = useState("");
  const [newVals, setNewVals] = useState<Record<Lang, string>>({
    en: "",
    ru: "",
    uz: "",
  });

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    Object.values(data).forEach((langObj) =>
      Object.keys(langObj).forEach((k) => keys.add(k))
    );
    return Array.from(keys).sort();
  }, [data]);

  const handleChange = (lang: Lang, key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const handleDelete = (key: string) => {
    setData((prev) => {
      const out: any = { ...prev };
      (Object.keys(out) as Lang[]).forEach((l) => {
        const copy = { ...out[l] };
        delete copy[key];
        out[l] = copy;
      });
      return out;
    });
  };

  const handleAdd = () => {
    if (!newKey) return;
    setData((prev) => ({
      en: { ...(prev.en || {}), [newKey]: newVals.en || "" },
      ru: { ...(prev.ru || {}), [newKey]: newVals.ru || "" },
      uz: { ...(prev.uz || {}), [newKey]: newVals.uz || "" },
    }));
    setNewKey("");
    setNewVals({ en: "", ru: "", uz: "" });
  };

  const applyToRuntime = () => {
    // Convert flattened maps back to nested objects and update i18n resource bundles
    (Object.keys(data) as Lang[]).forEach((lang) => {
      const nested = unflatten(data[lang]);
      try {
        // overwrite existing bundle
        i18n.addResourceBundle(lang, "translation", nested, true, true);
      } catch (e) {
        // ignore
        console.error("i18n apply error", e);
      }
    });
    alert(
      "Applied translations to running app (in-memory). Download to persist."
    );
  };

  const downloadJson = (lang: Lang) => {
    const nested = unflatten(data[lang]);
    const blob = new Blob([JSON.stringify(nested, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lang}.translation.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6 mx-auto max-w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-3">Translations manager</h3>

      <div className="mb-4 space-y-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            placeholder="new.key.path"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="border p-2 rounded w-full md:w-64 flex-shrink-0"
          />
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <input
              placeholder="EN value"
              value={newVals.en}
              onChange={(e) =>
                setNewVals((s) => ({ ...s, en: e.target.value }))
              }
              className="border p-2 rounded flex-1 min-w-0"
            />
            <input
              placeholder="RU value"
              value={newVals.ru}
              onChange={(e) =>
                setNewVals((s) => ({ ...s, ru: e.target.value }))
              }
              className="border p-2 rounded flex-1 min-w-0"
            />
            <input
              placeholder="UZ value"
              value={newVals.uz}
              onChange={(e) =>
                setNewVals((s) => ({ ...s, uz: e.target.value }))
              }
              className="border p-2 rounded flex-1 min-w-0"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Add
        </button>
      </div>

      <div className="overflow-auto max-h-72 border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left min-w-[200px]">Key</th>
              <th className="p-2 text-left min-w-[150px]">EN</th>
              <th className="p-2 text-left min-w-[150px]">RU</th>
              <th className="p-2 text-left min-w-[150px]">UZ</th>
              <th className="p-2 text-left min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map((k) => (
              <tr key={k} className="border-b">
                <td className="p-2 align-top min-w-[200px] break-all text-xs md:text-sm">
                  {k}
                </td>
                <td className="p-2 align-top min-w-[150px]">
                  <input
                    value={data.en[k] ?? ""}
                    onChange={(e) => handleChange("en", k, e.target.value)}
                    className="w-full border rounded p-1 text-xs md:text-sm min-w-0"
                  />
                </td>
                <td className="p-2 align-top min-w-[150px]">
                  <input
                    value={data.ru[k] ?? ""}
                    onChange={(e) => handleChange("ru", k, e.target.value)}
                    className="w-full border rounded p-1 text-xs md:text-sm min-w-0"
                  />
                </td>
                <td className="p-2 align-top min-w-[150px]">
                  <input
                    value={data.uz[k] ?? ""}
                    onChange={(e) => handleChange("uz", k, e.target.value)}
                    className="w-full border rounded p-1 text-xs md:text-sm min-w-0"
                  />
                </td>
                <td className="p-2 min-w-[80px]">
                  <button
                    onClick={() => handleDelete(k)}
                    className="text-red-600 text-xs md:text-sm px-2 py-1 hover:bg-red-50 rounded"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={applyToRuntime}
          className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium w-full sm:w-auto"
        >
          Apply to running app
        </button>
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <button
            onClick={() => downloadJson("en")}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm w-full sm:flex-1"
          >
            Download EN
          </button>
          <button
            onClick={() => downloadJson("ru")}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm w-full sm:flex-1"
          >
            Download RU
          </button>
          <button
            onClick={() => downloadJson("uz")}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm w-full sm:flex-1"
          >
            Download UZ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationsManager;
