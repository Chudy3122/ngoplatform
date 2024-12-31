"use client"

import { useTranslations } from "@/hooks/useTranslations";
import React, { useState, useEffect } from 'react';

const SalaryCalculator = () => {
  const t = useTranslations();
  const [contractType, setContractType] = useState('employment');
  const [formData, setFormData] = useState({
    workTime: 'full',
    workFromHome: false,
    jointTaxation: false,
    under26: false,
    isStudent: false,
    voluntaryHealthInsurance: false,
    accidentInsurance: 1.67,
    salary: '',
    bonus: '',
    zusOption: 'thisEmployer',
    costOption: '20',
    zusType: 'none',
    taxType: '12/32',
    businessCosts: 0,
    varyingSalary: false,
  });

  const [calculations, setCalculations] = useState({
    grossSalary: 0,
    netSalary: 0,
    taxBase: 0,
    tax: 0,
    healthInsurance: 0,
    pensionInsurance: 0,
    disabilityInsurance: 0,
    sicknessInsurance: 0,
    totalDeductions: 0
  });

  const calculateSalary = () => {
    const gross = Number(formData.salary) + Number(formData.bonus);
    let net = gross;
    
    // Podstawowe stawki
    const rates = {
      pension: 0.0976, // emerytalna pracownik
      disability: 0.015, // rentowa pracownik
      sickness: 0.0245, // chorobowa
      health: 0.09, // zdrowotna
      tax: 0.12 // podatek dochodowy
    };
  
    let calculations = {
      grossSalary: gross,
      netSalary: 0,
      pensionInsurance: 0,
      disabilityInsurance: 0,
      sicknessInsurance: 0,
      healthInsurance: 0,
      tax: 0,
      taxBase: 0,
      totalDeductions: 0
    };
  
    switch (contractType) {
      case 'employment':
        calculations.pensionInsurance = gross * rates.pension;
        calculations.disabilityInsurance = gross * rates.disability;
        calculations.sicknessInsurance = gross * rates.sickness;
        const socialInsurance = calculations.pensionInsurance + 
                              calculations.disabilityInsurance + 
                              calculations.sicknessInsurance;
        
        calculations.healthInsurance = (gross - socialInsurance) * rates.health;
        calculations.taxBase = Math.round(gross - socialInsurance - 250);
        
        // Zerowy PIT dla osób do 26 roku życia
        calculations.tax = formData.under26 ? 0 : Math.round(calculations.taxBase * rates.tax);
        
        calculations.totalDeductions = socialInsurance + calculations.healthInsurance + calculations.tax;
        calculations.netSalary = gross - calculations.totalDeductions;
        break;
  
        case 'contract':
          if (formData.isStudent && formData.under26) {
            // Student do 26 lat - brak potrąceń
            calculations.netSalary = gross;
          } else {
            if (formData.zusOption === 'thisEmployer') {
              // Standardowe składki ZUS
              calculations.pensionInsurance = gross * rates.pension;
              calculations.disabilityInsurance = gross * rates.disability;
              calculations.sicknessInsurance = gross * rates.sickness;
              const socialInsurance = calculations.pensionInsurance + 
                                    calculations.disabilityInsurance + 
                                    calculations.sicknessInsurance;
              
              calculations.healthInsurance = (gross - socialInsurance) * rates.health;
              calculations.taxBase = Math.round(gross - socialInsurance - 250);
              
              // Zerowy PIT tylko dla osób do 26 lat
              calculations.tax = formData.under26 ? 0 : Math.round(calculations.taxBase * rates.tax);
              
              calculations.totalDeductions = socialInsurance + calculations.healthInsurance + calculations.tax;
              calculations.netSalary = gross - calculations.totalDeductions;
            } else if (formData.zusOption === 'otherEmployer') {
              // Tylko podatek, bez składek ZUS
              calculations.taxBase = gross - 250;
              calculations.tax = formData.under26 ? 0 : Math.round(calculations.taxBase * rates.tax);
              calculations.netSalary = gross - calculations.tax;
            }
          }
          break;
  
      case 'work':
        // Umowa o dzieło - tylko podatek dochodowy
        const costRate = formData.costOption === '20' ? 0.2 : 0.5;
        const costs = gross * costRate;
        calculations.taxBase = gross - costs;
        calculations.tax = Math.round(calculations.taxBase * rates.tax);
        calculations.netSalary = gross - calculations.tax;
        break;
  
      case 'b2b':
        // Implementacja dla B2B zależy od wybranego typu składek ZUS
        switch(formData.zusType) {
          case 'none': // Ulga na start
            calculations.taxBase = gross;
            calculations.tax = formData.taxType === '19' ? 
              Math.round(calculations.taxBase * 0.19) : 
              Math.round(calculations.taxBase * 0.12);
            calculations.netSalary = gross - calculations.tax;
            break;
            
          case 'preferential': // Preferencyjny ZUS
            // Tu należy dodać stałe kwoty dla preferencyjnego ZUS
            const preferentialZUS = 400; // przykładowa kwota
            calculations.totalDeductions = preferentialZUS;
            calculations.taxBase = gross - preferentialZUS;
            calculations.tax = formData.taxType === '19' ? 
              Math.round(calculations.taxBase * 0.19) : 
              Math.round(calculations.taxBase * 0.12);
            calculations.netSalary = gross - calculations.totalDeductions - calculations.tax;
            break;
            
          case 'normal': // Normalny ZUS
            // Tu należy dodać stałe kwoty dla normalnego ZUS
            const normalZUS = 1500; // przykładowa kwota
            calculations.totalDeductions = normalZUS;
            calculations.taxBase = gross - normalZUS;
            calculations.tax = formData.taxType === '19' ? 
              Math.round(calculations.taxBase * 0.19) : 
              Math.round(calculations.taxBase * 0.12);
            calculations.netSalary = gross - calculations.totalDeductions - calculations.tax;
            break;
        }
        break;
    }
  
    setCalculations(calculations);
  };

  const renderEmploymentFields = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.workTime.label}</span>
        <select 
          className="w-48 p-2 border rounded bg-white"
          value={formData.workTime}
          onChange={(e) => setFormData({...formData, workTime: e.target.value})}
        >
          <option value="full">{t.calculator.fields.workTime.options.full}</option>
          <option value="3/4">{t.calculator.fields.workTime.options.threeQuarters}</option>
          <option value="1/2">{t.calculator.fields.workTime.options.half}</option>
          <option value="1/4">{t.calculator.fields.workTime.options.quarter}</option>
        </select>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.workFromHome}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.workFromHome}
              onChange={() => setFormData({...formData, workFromHome: true})}
            />
            <span>{t.common.yes}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.workFromHome}
              onChange={() => setFormData({...formData, workFromHome: false})}
            />
            <span>{t.common.no}</span>
          </label>
        </div>
      </div>

      

      {/* Dodana nowa opcja */}
      <div className="flex justify-between items-center">
        <span className="text-gray-700">Mam poniżej 26 lat:</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.under26}
              onChange={() => setFormData({...formData, under26: true})}
            />
            <span>tak</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.under26}
              onChange={() => setFormData({...formData, under26: false})}
            />
            <span>nie</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">Wspólne rozliczanie z małżonkiem:</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.jointTaxation}
              onChange={() => setFormData({...formData, jointTaxation: true})}
            />
            <span>tak</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.jointTaxation}
              onChange={() => setFormData({...formData, jointTaxation: false})}
            />
            <span>nie</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">Ubezpieczenie wypadkowe:</span>
        <input
          type="number"
          step="0.01"
          value={formData.accidentInsurance}
          onChange={(e) => setFormData({...formData, accidentInsurance: Number(e.target.value)})}
          className="w-48 p-2 border rounded"
        />
      </div>
    </div>
  );

  const renderWorkFields = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.costOptions.title}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.costOption === '20'}
              onChange={() => setFormData({...formData, costOption: '20'})}
            />
            <span>{t.calculator.fields.costOptions.twenty}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.costOption === '50'}
              onChange={() => setFormData({...formData, costOption: '50'})}
            />
            <span>{t.calculator.fields.costOptions.fifty}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContractFields = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <span className="text-gray-700">{t.calculator.fields.zusPayment.title}</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.zusOption === 'thisEmployer'}
              onChange={() => setFormData({...formData, zusOption: 'thisEmployer'})}
            />
            <span>{t.calculator.fields.zusPayment.thisEmployer}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.zusOption === 'otherEmployer'}
              onChange={() => setFormData({...formData, zusOption: 'otherEmployer'})}
            />
            <span>{t.calculator.fields.zusPayment.otherEmployer}</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.isStudent}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.isStudent}
              onChange={() => setFormData({...formData, isStudent: true})}
            />
            <span>{t.common.yes}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.isStudent}
              onChange={() => setFormData({...formData, isStudent: false})}
            />
            <span>{t.common.no}</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.under26}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.under26}
              onChange={() => setFormData({...formData, under26: true})}
            />
            <span>{t.common.yes}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.under26}
              onChange={() => setFormData({...formData, under26: false})}
            />
            <span>{t.common.no}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderB2bFields = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <span className="text-gray-700">{t.calculator.fields.zusType.title}</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.zusType === 'none'}
              onChange={() => setFormData({...formData, zusType: 'none'})}
            />
            <span>{t.calculator.fields.zusType.none}</span>
            <span className="text-sm text-gray-500">{t.calculator.fields.zusType.noneDescription}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.zusType === 'preferential'}
              onChange={() => setFormData({...formData, zusType: 'preferential'})}
            />
            <span>{t.calculator.fields.zusType.preferential}</span>
            <span className="text-sm text-gray-500">{t.calculator.fields.zusType.preferentialDescription}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.zusType === 'normal'}
              onChange={() => setFormData({...formData, zusType: 'normal'})}
            />
            <span>{t.calculator.fields.zusType.normal}</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.taxType.title}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.taxType === '12/32'}
              onChange={() => setFormData({...formData, taxType: '12/32'})}
            />
            <span>{t.calculator.fields.taxType.progressive}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.taxType === '19'}
              onChange={() => setFormData({...formData, taxType: '19'})}
            />
            <span>{t.calculator.fields.taxType.linear}</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.voluntaryHealthInsurance}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.voluntaryHealthInsurance}
              onChange={() => setFormData({...formData, voluntaryHealthInsurance: true})}
            />
            <span>{t.common.yes}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.voluntaryHealthInsurance}
              onChange={() => setFormData({...formData, voluntaryHealthInsurance: false})}
            />
            <span>{t.common.no}</span>
          </label>
        </div>
      </div>
  
      <div className="flex justify-between items-center">
        <span className="text-gray-700">{t.calculator.fields.businessCosts}</span>
        <input
          type="number"
          value={formData.businessCosts}
          onChange={(e) => setFormData({...formData, businessCosts: Number(e.target.value)})}
          className="w-48 p-2 border rounded"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Nagłówek */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{t.calculator.title}</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Lewa kolumna - formularz */}
        <div className="space-y-6">
          {/* Wybór typu umowy */}
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
            {[
              { id: 'employment', label: t.calculator.contractTypes.employment },
              { id: 'contract', label: t.calculator.contractTypes.contract },
              { id: 'work', label: t.calculator.contractTypes.work },
              { id: 'b2b', label: t.calculator.contractTypes.b2b },
            ].map((type) => (
              <button
                key={type.id}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
                  contractType === type.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setContractType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

   {/* Dynamiczne pola formularza */}
   {contractType === 'employment' && renderEmploymentFields()}
          {contractType === 'contract' && renderContractFields()}
          {contractType === 'work' && renderWorkFields()}
          {contractType === 'b2b' && renderB2bFields()}

          {/* Sekcja wynagrodzenia */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t.calculator.fields.salary}
                </label>
                <div className="flex">
                  <input
                    type="number"
                    className="w-full p-2 border rounded-l"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  />
                  <span className="bg-gray-50 px-3 py-2 border-t border-r border-b rounded-r">
                    zł
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t.calculator.fields.bonus}
                </label>
                <div className="flex">
                  <input
                    type="number"
                    className="w-full p-2 border rounded-l"
                    value={formData.bonus}
                    onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                  />
                  <span className="bg-gray-50 px-3 py-2 border-t border-r border-b rounded-r">
                    zł
                  </span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.varyingSalary}
                onChange={(e) => setFormData({...formData, varyingSalary: e.target.checked})}
              />
              <span className="text-sm text-gray-700">
                {t.calculator.fields.varyingSalary}
              </span>
            </label>
          </div>

          <button
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={calculateSalary}
          >
            {t.calculator.fields.calculate}
          </button>
        </div>

        {/* Prawa kolumna - wyniki */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-medium text-lg mb-6">{t.calculator.results.summary}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-white rounded">
              <span className="font-medium">{t.calculator.results.grossSalary}</span>
              <span className="font-medium">{calculations.grossSalary.toFixed(2)} zł</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t.calculator.results.contributions.title}</h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>{t.calculator.results.contributions.pension}</span>
                  <span>{calculations.pensionInsurance.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.calculator.results.contributions.disability}</span>
                  <span>{calculations.disabilityInsurance.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.calculator.results.contributions.sickness}</span>
                  <span>{calculations.sicknessInsurance.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.calculator.results.contributions.health}</span>
                  <span>{calculations.healthInsurance.toFixed(2)} zł</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t.calculator.results.tax.title}</h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>{t.calculator.results.tax.advance}</span>
                  <span>{calculations.tax.toFixed(2)} zł</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-blue-50 rounded">
              <span className="font-medium">{t.calculator.results.netSalary}</span>
              <span className="font-medium">{calculations.netSalary.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;