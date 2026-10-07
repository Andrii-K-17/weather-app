package weather

import (
	"math"
	"strings"
	"time"

	"weatherapp/internal/owm"
)

const (
	hourlySlots     = 8 // 8 × 3h = next 24 hours
	minSlotsLastDay = 4 // a trailing day with fewer slots is partial and dropped
)

// BuildOverview merges current weather and the 3-hour forecast into one screen-ready model.
func BuildOverview(cur owm.CurrentResponse, fc owm.ForecastResponse, fetchedAt time.Time) Overview {
	loc := time.FixedZone("city", cur.Timezone)
	condition := toCondition(cur.Weather)

	buckets := groupByLocalDate(fc.List, loc)
	if n := len(buckets); n > 1 && len(buckets[n-1].items) < minSlotsLastDay {
		buckets = buckets[:n-1]
	}

	today := time.Unix(cur.Dt, 0).In(loc).Format(time.DateOnly)
	daily := make([]DailyPoint, 0, len(buckets))
	for _, b := range buckets {
		dp := summarizeDay(b)
		if b.date == today {
			dp.TempMin = min(dp.TempMin, cur.Main.Temp)
			dp.TempMax = max(dp.TempMax, cur.Main.Temp)
		}
		daily = append(daily, dp)
	}

	tempMin, tempMax := cur.Main.TempMin, cur.Main.TempMax
	if len(daily) > 0 && daily[0].Date == today {
		tempMin, tempMax = daily[0].TempMin, daily[0].TempMax
	}

	hourly := make([]HourlyPoint, 0, hourlySlots)
	for _, it := range fc.List {
		if len(hourly) == hourlySlots {
			break
		}
		hourly = append(hourly, HourlyPoint{
			Time:      it.Dt,
			Temp:      it.Main.Temp,
			Condition: toCondition(it.Weather),
			Pop:       it.Pop,
		})
	}

	return Overview{
		Location: Location{
			Name:           cur.Name,
			Country:        cur.Sys.Country,
			Lat:            cur.Coord.Lat,
			Lon:            cur.Coord.Lon,
			TimezoneOffset: cur.Timezone,
		},
		Current: Current{
			ObservedAt: cur.Dt,
			Temp:       cur.Main.Temp,
			FeelsLike:  cur.Main.FeelsLike,
			TempMin:    tempMin,
			TempMax:    tempMax,
			Condition:  condition,
			IsDay:      strings.HasSuffix(condition.Icon, "d"),
			Humidity:   cur.Main.Humidity,
			Pressure:   cur.Main.Pressure,
			Visibility: cur.Visibility,
			Clouds:     cur.Clouds.All,
			WindSpeed:  cur.Wind.Speed,
			WindDeg:    cur.Wind.Deg,
			WindGust:   cur.Wind.Gust,
			Sunrise:    cur.Sys.Sunrise,
			Sunset:     cur.Sys.Sunset,
		},
		Hourly:    hourly,
		Daily:     daily,
		FetchedAt: fetchedAt.UTC(),
	}
}

type dayBucket struct {
	date  string
	first int64
	items []owm.ForecastItem
}

// groupByLocalDate groups forecast items into separate buckets according to their local calendar date.
func groupByLocalDate(items []owm.ForecastItem, loc *time.Location) []dayBucket {
	var days []dayBucket
	for _, it := range items {
		d := time.Unix(it.Dt, 0).In(loc).Format(time.DateOnly)
		if n := len(days); n == 0 || days[n-1].date != d {
			days = append(days, dayBucket{
				date:  d,
				first: it.Dt,
			})
		}
		last := &days[len(days)-1]
		last.items = append(last.items, it)
	}
	return days
}

// summarizeDay calculates daily temperature extremes, maximum precipitation probability,
// and dominant condition for a single day bucket.
func summarizeDay(b dayBucket) DailyPoint {
	tMin, tMax := math.Inf(1), math.Inf(-1)
	var pop float64
	for _, it := range b.items {
		tMin = min(tMin, it.Main.Temp)
		tMax = max(tMax, it.Main.Temp)
		pop = max(pop, it.Pop)
	}
	return DailyPoint{
		Date:      b.date,
		Time:      b.first,
		TempMin:   tMin,
		TempMax:   tMax,
		Condition: dominantCondition(b.items),
		Pop:       pop,
	}
}

// dominantCondition picks the most frequent condition among daytime slots.
func dominantCondition(items []owm.ForecastItem) Condition {
	pool := make([]owm.ForecastItem, 0, len(items))
	for _, it := range items {
		if len(it.Weather) > 0 && strings.HasSuffix(it.Weather[0].Icon, "d") {
			pool = append(pool, it)
		}
	}
	if len(pool) == 0 {
		pool = items
	}

	counts := map[int]int{}
	sample := map[int]Condition{}
	for _, it := range pool {
		if len(it.Weather) == 0 {
			continue
		}
		c := toCondition(it.Weather)
		counts[c.ID]++
		if _, ok := sample[c.ID]; !ok {
			sample[c.ID] = c
		}
	}

	bestID, bestCount := 0, 0
	for id, n := range counts {
		switch {
		case n > bestCount:
		case n == bestCount && severity(id) > severity(bestID):
		case n == bestCount && severity(id) == severity(bestID) && id < bestID:
		default:
			continue
		}
		bestID, bestCount = id, n
	}

	c := sample[bestID]
	c.Icon = dayIcon(c.Icon)
	return c
}

// severity returns a numeric severity level for a given weather condition ID to prioritize worse weather.
func severity(id int) int {
	switch {
	case id >= 200 && id < 300:
		return 5 // thunderstorm
	case id >= 600 && id < 700:
		return 4 // snow
	case id >= 500 && id < 600:
		return 3 // rain
	case id >= 300 && id < 400:
		return 2 // drizzle
	case id >= 700 && id < 800:
		return 1 // atmosphere
	default:
		return 0
	}
}

// dayIcon forces the daytime variant.
func dayIcon(icon string) string {
	if len(icon) == 3 {
		return icon[:2] + "d"
	}
	return icon
}

// toCondition converts a slice of OWM condition models into a Condition structure.
func toCondition(ws []owm.Condition) Condition {
	if len(ws) == 0 {
		return Condition{}
	}
	w := ws[0]
	return Condition{
		ID:          w.ID,
		Main:        w.Main,
		Description: w.Description,
		Icon:        w.Icon,
	}
}
