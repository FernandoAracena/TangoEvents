using System.Collections.Generic;
using System.Globalization;

namespace TangoKultura.Helpers
{
    public static class NorwayCountyHelper
    {
        // Diccionario ciudad -> county (en inglés)
        private static readonly Dictionary<string, string> CityToCounty = new(StringComparer.OrdinalIgnoreCase)
        {
            // Ejemplos, agregar más según necesidad
            { "Oslo", "Oslo" },
            { "Bergen", "Vestland" },
            { "Trondheim", "Trøndelag" },
            { "Stavanger", "Rogaland" },
            { "Tromsø", "Troms og Finnmark" },
            { "Kristiansand", "Agder" },
            { "Bodø", "Nordland" },
            { "Drammen", "Viken" },
            { "Fredrikstad", "Viken" },
            { "Ålesund", "Møre og Romsdal" },
            { "Sandnes", "Rogaland" },
            { "Tønsberg", "Vestfold og Telemark" },
            { "Hamar", "Innlandet" },
            { "Molde", "Møre og Romsdal" },
            { "Lillehammer", "Innlandet" },
            // ...agregar todas las ciudades relevantes
        };

        public static string GetCountyForCity(string city)
        {
            if (string.IsNullOrWhiteSpace(city)) return "Unknown";
            return CityToCounty.TryGetValue(city.Trim(), out var county) ? county : "Unknown";
        }
    }
}
