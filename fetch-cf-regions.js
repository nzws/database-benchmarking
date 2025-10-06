async function fetchRegions(group) {
  const response = await fetch(
    "https://www.cloudflarestatus.com/api/v2/summary.json",
  );
  const data = await response.json();

  const groups = data.components.filter((c) => c.group && c.name === group);
  const groupIds = groups.map((g) => g.id);

  const colos = data.components
    .filter((c) => groupIds.includes(c.group_id))
    .map((c) => {
      const match = c.name.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : null;
    })
    .filter((code) => code !== null);

  console.log(`Colos in group "${group}":`, colos);
}

fetchRegions("Asia");
