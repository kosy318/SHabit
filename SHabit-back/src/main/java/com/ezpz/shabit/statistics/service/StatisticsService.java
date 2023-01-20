package com.ezpz.shabit.statistics.service;

import com.ezpz.shabit.statistics.entity.Daily;
import com.ezpz.shabit.statistics.entity.Statistics;

import java.util.List;

public interface StatisticsService {
    List<Daily> getTodayData(String email);
    List<Statistics> getWeeklyData(String email, int page);
    List<Statistics> getMonthlyData(String email, int page);
}
