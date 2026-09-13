package com.smartbudget.service;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.account.AccountSummaryDto;
import com.smartbudget.dto.account.CreateAccountRequest;
import com.smartbudget.dto.account.UpdateAccountRequest;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.AccountType;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AccountDto> getUserAccounts(Long userId) {
        return accountRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountDto getAccountById(Long accountId, Long userId) {
        Account account = accountRepository.findByIdAndUserIdAndIsActiveTrue(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));
        return mapToDto(account);
    }

    @Transactional
    public AccountDto createAccount(Long userId, CreateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Account account = Account.builder()
                .user(user)
                .name(request.getName().trim())
                .accountType(request.getAccountType())
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase().trim() : user.getDefaultCurrency())
                .institutionName(request.getInstitutionName())
                .accountNumberMask(request.getAccountNumberMask())
                .isActive(true)
                .build();

        Account saved = accountRepository.save(account);
        return mapToDto(saved);
    }

    @Transactional
    public AccountDto updateAccount(Long accountId, Long userId, UpdateAccountRequest request) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        account.setName(request.getName().trim());
        account.setAccountType(request.getAccountType());
        account.setInstitutionName(request.getInstitutionName());
        account.setAccountNumberMask(request.getAccountNumberMask());
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
        }

        Account updated = accountRepository.save(account);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteAccount(Long accountId, Long userId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        account.setIsActive(false);
        accountRepository.save(account);
    }

    @Transactional(readOnly = true)
    public AccountSummaryDto getAccountSummary(Long userId) {
        List<Account> activeAccounts = accountRepository.findByUserIdAndIsActiveTrue(userId);

        BigDecimal cashAndBank = BigDecimal.ZERO;
        BigDecimal creditLiabilities = BigDecimal.ZERO;
        BigDecimal investments = BigDecimal.ZERO;
        BigDecimal netWorth = BigDecimal.ZERO;

        for (Account acc : activeAccounts) {
            BigDecimal bal = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            if (acc.getAccountType() == AccountType.CREDIT_CARD || acc.getAccountType() == AccountType.LOAN) {
                creditLiabilities = creditLiabilities.add(bal.abs());
                netWorth = netWorth.subtract(bal.abs());
            } else if (acc.getAccountType() == AccountType.INVESTMENT) {
                investments = investments.add(bal);
                netWorth = netWorth.add(bal);
            } else {
                cashAndBank = cashAndBank.add(bal);
                netWorth = netWorth.add(bal);
            }
        }

        List<AccountDto> accountDtos = activeAccounts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return AccountSummaryDto.builder()
                .netWorth(netWorth)
                .totalCashAndBank(cashAndBank)
                .totalCreditCardLiabilities(creditLiabilities)
                .totalInvestments(investments)
                .activeAccountsCount(activeAccounts.size())
                .accounts(accountDtos)
                .build();
    }

    public AccountDto mapToDto(Account account) {
        if (account == null) return null;
        return AccountDto.builder()
                .id(account.getId())
                .name(account.getName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .institutionName(account.getInstitutionName())
                .accountNumberMask(account.getAccountNumberMask())
                .isActive(account.getIsActive())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
